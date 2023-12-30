const path = require('path')
const webpack = require('webpack')
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

    return {
      mode: isProd ? 'production' : 'development',
      entry: path.resolve(__dirname, './main.js'),
      target: isServerBuild ? 'node' : 'web',
      devtool: 'source-map',
      resolve: {
        extensions: ['.js', '.ts'],
        alias: process.env.WEBPACK4
          ? {
              webpack: 'webpack4',
            }
          : {},
      },
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
              // reactivityTransform: true,
              compilerOptions: {
                isCustomElement: (tag) => tag.startsWith('custom-'),
              },
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
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
          },
          {
            test: /\.ts$/,
            use: [
              {
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
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        }),
      ],
      optimization: {
        minimize,
      },
      devServer: {
        hot: true,
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
