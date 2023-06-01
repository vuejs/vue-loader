/* env jest */
import * as path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import hash from 'hash-sum'
// import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { fs as mfs } from 'memfs'
import { JSDOM, VirtualConsole } from 'jsdom'
import { VueLoaderPlugin } from '..'
import type { VueLoaderOptions } from '..'

export const DEFAULT_VUE_USE = {
  loader: 'vue-loader',
  options: {
    experimentalInlineMatchResource: Boolean(process.env.INLINE_MATCH_RESOURCE),
  },
}

const baseConfig: webpack.Configuration = {
  mode: 'development',
  devtool: false,
  output: {
    path: '/',
    filename: 'test.build.js',
    publicPath: '',
  },
  resolve: {
    extensions: ['.js', '.ts'],
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
        use: [DEFAULT_VUE_USE],
      },
      {
        test: /\.ts$/,
        loader: process.env.WEBPACK4
          ? require.resolve('ts-loader')
          : require.resolve('ts-loader-v9'),
        options: {
          transpileOnly: true,
          appendTsSuffixTo: [/\.vue$/],
        },
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

  if (!options.experiments?.css) {
    config.module?.rules?.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    })
  }

  if (config.vue && config.module) {
    const vueOptions = {
      // Test experimental inline match resource by default
      experimentalInlineMatchResource: Boolean(
        process.env.INLINE_MATCH_RESOURCE
      ),
      ...options.vue,
    }

    delete config.vue
    const vueIndex = config.module.rules!.findIndex(
      (r: any) => r.test instanceof RegExp && r.test.test('.vue')
    )
    const vueRule = config.module.rules![vueIndex]

    // Detect `Rule.use` or `Rule.loader` and `Rule.options` combination
    if (vueRule && typeof vueRule === 'object' && Array.isArray(vueRule.use)) {
      // Vue usually locates at the first loader
      if (typeof vueRule.use?.[0] === 'object') {
        vueRule.use[0] = Object.assign({}, vueRule.use[0], {
          options: vueOptions,
        })
      }
    } else {
      config.module.rules![vueIndex] = Object.assign({}, vueRule, {
        options: vueOptions,
      })
    }
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
      const errors = stats?.compilation.errors
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
          stats: stats!,
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
    `<!DOCTYPE html><html><head></head><body></body></html>`,
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
