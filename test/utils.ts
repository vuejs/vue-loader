/* env jest */
import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
// import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { fs as mfs } from 'memfs'

import { VueLoaderPlugin, VueLoaderOptions } from '../dist/index'

const baseConfig: webpack.Configuration = {
  mode: 'development',
  devtool: false,
  output: {
    path: '/',
    filename: 'test.build.js'
  },
  resolve: {
    alias: {
      // this isn't technically needed, since the default `vue` entry for bundlers
      // is a simple `export * from '@vue/runtime-dom`. However having this
      // extra re-export somehow causes webpack to always invalidate the module
      // on the first HMR update and causes the page to reload.
      vue: '@vue/runtime-dom'
    }
  },
  resolveLoader: {
    alias: {
      'vue-loader': require.resolve('../dist')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: { limit: 8192 }
        }
      },
      {
        test: /\.css$/,
        use: [
          // {
          //   loader: MiniCssExtractPlugin.loader,
          //   options: { hmr: true }
          // },
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
    // new MiniCssExtractPlugin({
    //   filename: '[name].css'
    // })
  ]
}

type BundleOptions = webpack.Configuration & {
  vue?: VueLoaderOptions
  modify?: (config: webpack.Configuration) => void
  suppressJSDOMConsole?: boolean
}

export function bundle(options: BundleOptions, wontThrowError?: boolean) {
  let config: BundleOptions = merge({}, baseConfig, options)

  if (config.vue && config.module) {
    const vueOptions = options.vue
    delete config.vue
    const vueIndex = config.module.rules.findIndex(
      r => r.test instanceof RegExp && r.test.test('.vue')
    )
    const vueRule = config.module.rules[vueIndex]
    config.module.rules[vueIndex] = Object.assign({}, vueRule, {
      options: vueOptions
    })
  }

  if (typeof config.entry === 'string' && /\.vue/.test(config.entry)) {
    const vueFile = config.entry
    config = merge(config, {
      entry: require.resolve('./fixtures/entry'),
      resolve: {
        alias: {
          '~target': path.resolve(__dirname, './fixtures', vueFile)
        }
      }
    })
  }

  if (options.modify) {
    delete config.modify
    options.modify(config)
  }

  const webpackCompiler = webpack(config)
  webpackCompiler.outputFileSystem = Object.assign(
    {
      join: path.join.bind(path)
    },
    mfs
  )

  return new Promise((resolve, reject) => {
    webpackCompiler.run((err, stats) => {
      const errors = stats.compilation.errors
      if (!wontThrowError) {
        expect(err).toBeNull()
        if (errors && errors.length) {
          errors.forEach(error => {
            console.error(error.message)
          })
        }
        expect(errors).toHaveLength(0)
      }

      if (err) {
        reject(err)
      } else {
        resolve({
          code: mfs.readFileSync('/test.build.js').toString(),
          stats
        })
      }
    })
  })
}
