const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const hash = require('hash-sum')
const VueLoaderPlugin = require('../dist/plugin').default
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env = {}) => {
  const isProd = env.prod
  const isSSR = env.ssr

  /**
   * Some notes regarding config for the server build of an SSR app:
   * 1. target: 'node'
   * 2. output.libraryTarget: 'commonjs' (so the exported app can be required)
   * 3. externals: this is mostly for faster builds.
   *    - externalize @vue/* deps via commonjs require()
   *    - externalize client side deps that are never used on the server, e.g.
   *      ones that are only used in onMounted() to empty modules
   * 4. If using cache-loader or any other forms of cache, make sure the cache
   *    key takes client vs. server builds into account!
   */
  const genConfig = (isServerBuild = false) => {
    const minimize = isProd && !isServerBuild && !env.noMinimize
    const useBabel = isProd && !isServerBuild && !env.noBabel

    return {
      mode: isProd ? 'production' : 'development',
      entry: path.resolve(__dirname, './main.js'),
      target: isServerBuild ? 'node' : 'web',
      devtool: 'source-map',
      output: {
        path: path.resolve(
          __dirname,
          isSSR ? (isServerBuild ? 'dist-ssr/server' : 'dist-ssr/dist') : 'dist'
        ),
        filename: '[name].js',
        publicPath: '/dist/',
        libraryTarget: isServerBuild ? 'commonjs' : undefined,
      },
      externals: isServerBuild
        ? [
            (ctx, request, cb) => {
              if (/^@vue/.test(request)) {
                return cb(null, 'commonjs ' + request)
              }
              cb()
            },
          ]
        : undefined,
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              refSugar: true,
              // enableTsInTemplate: false,
            },
          },
          {
            test: /\.png$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 8192,
                },
              },
            ],
          },
          {
            test: /\.css$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  hmr: !isProd,
                },
              },
              'css-loader',
            ],
          },
          // {
          //   test: /\.js$/,
          //   use: [
          //     {
          //       loader: 'cache-loader',
          //       options: {
          //         cacheIdentifier: hash(
          //           // deps
          //           fs.readFileSync(
          //             path.resolve(__dirname, '../package.json')
          //           ) +
          //             // env
          //             JSON.stringify(env) +
          //             // client vs. server build
          //             isServerBuild
          //         ),
          //         cacheDirectory: path.resolve(__dirname, '../.cache'),
          //       },
          //     },
          //     ...(useBabel
          //       ? [
          //           {
          //             loader: 'babel-loader',
          //             options: {
          //               // use yarn build-example --env.noMinimize to verify that
          //               // babel is properly applied to all js code, including the
          //               // render function compiled from SFC templates.
          //               presets: ['@babel/preset-env'],
          //             },
          //           },
          //         ]
          //       : []),
          //   ],
          // },
          {
            test: /\.ts$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  appendTsSuffixTo: [/\.vue$/],
                },
              },
            ],
          },
          // target <docs> custom blocks
          {
            resourceQuery: /blockType=docs/,
            loader: require.resolve('./docs-loader'),
          },
        ],
      },
      plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
        new webpack.DefinePlugin({
          __IS_SSR__: !!isSSR,
          __VUE_OPTIONS_API__: true,
          __VUE_PROD_DEVTOOLS__: false,
        }),
      ],
      optimization: {
        minimize,
      },
      devServer: {
        stats: 'minimal',
        contentBase: __dirname,
        overlay: true,
      },
      resolveLoader: {
        alias: {
          'vue-loader': require.resolve('../'),
        },
      },
    }
  }

  if (!isSSR) {
    return genConfig()
  } else {
    return [genConfig(), genConfig(true)]
  }
}
