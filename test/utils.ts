/* env jest */
import * as path from 'path'
import webpack = require('webpack')
import merge from 'webpack-merge'
import hash = require('hash-sum')
// import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { fs as mfs } from 'memfs'

import { JSDOM, VirtualConsole } from 'jsdom'

import { VueLoaderPlugin, VueLoaderOptions } from '../dist/index'

const baseConfig: webpack.Configuration = {
  mode: 'development',
  devtool: false,
  output: {
    path: '/',
    filename: 'test.build.js',
    publicPath: '',
  },
  resolveLoader: {
    alias: {
      'vue-loader': require.resolve('../dist'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    // new MiniCssExtractPlugin({
    //   filename: '[name].css',
    // }),
  ],
}

type BundleOptions = webpack.Configuration & {
  vue?: VueLoaderOptions
  modify?: (config: webpack.Configuration) => void
}

export function bundle(
  options: BundleOptions,
  wontThrowError?: boolean
): Promise<{
  code: string
  stats: webpack.Stats
}> {
  let config: BundleOptions = merge({}, baseConfig, options)

  if (config.vue && config.module) {
    const vueOptions = options.vue
    delete config.vue
    const vueIndex = config.module.rules.findIndex(
      (r) => r.test instanceof RegExp && r.test.test('.vue')
    )
    const vueRule = config.module.rules[vueIndex]
    config.module.rules[vueIndex] = Object.assign({}, vueRule, {
      options: vueOptions,
    })
  }

  if (typeof config.entry === 'string' && /\.vue/.test(config.entry)) {
    const vueFile = config.entry
    config = merge(config, {
      entry: require.resolve('./fixtures/entry'),
      resolve: {
        alias: {
          '~target': path.resolve(__dirname, './fixtures', vueFile),
        },
      },
    })
  }

  if (options.modify) {
    delete config.modify
    options.modify(config)
  }

  const webpackCompiler = webpack(config)
  webpackCompiler.outputFileSystem = Object.assign(
    {
      join: path.join.bind(path),
    },
    mfs
  )

  return new Promise((resolve, reject) => {
    webpackCompiler.run((err, stats) => {
      const errors = stats.compilation.errors
      if (!wontThrowError) {
        expect(err).toBeNull()
        if (errors && errors.length) {
          errors.forEach((error) => {
            console.error(error)
          })
        }
        expect(errors).toHaveLength(0)
      }

      if (err) {
        reject(err)
      } else {
        resolve({
          code: mfs.readFileSync('/test.build.js').toString(),
          stats,
        })
      }
    })
  })
}

export async function mockBundleAndRun(
  options: BundleOptions,
  wontThrowError?: boolean
) {
  const { code, stats } = await bundle(options, wontThrowError)

  const dom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body><div id="#app"></div></body></html>`,
    {
      runScripts: 'outside-only',
      virtualConsole: new VirtualConsole(),
    }
  )
  try {
    dom.window.eval(code)
  } catch (e) {
    console.error(`JSDOM error:\n${e.stack}`)
    throw new Error(e)
  }

  const { window } = dom
  const { componentModule, exports, instance } = window

  return {
    window,

    componentModule,
    exports,
    instance,

    code,
    stats,
  }
}

export function normalizeNewline(input: string): string {
  return input.replace(new RegExp('\r\n', 'g'), '\n')
}

// see the logic at src/index.ts
// in non-production environment, shortFilePath is used to generate scope id
export function genId(fixtureName: string): string {
  return hash(path.join('test', 'fixtures', fixtureName).replace(/\\/g, '/'))
}

export { mfs }
