const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const hash = require('hash-sum')
const VueLoaderPlugin = require('../dist/plugin').default
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env = {}) => {
  const isProd = env.prod
  const minimize = isProd && !env.noMinimize
  const babel = isProd && !env.noBabel

  return {
    mode: isProd ? 'production' : 'development',
    entry: path.resolve(__dirname, './main.js'),
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      publicPath: '/dist/',
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
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
        {
          test: /\.js$/,
          use: [
            {
              loader: 'cache-loader',
              options: {
                cacheIdentifier: hash(
                  fs.readFileSync(path.resolve(__dirname, '../package.json')) +
                    JSON.stringify(env)
                ),
                cacheDirectory: path.resolve(__dirname, '../.cache'),
              },
            },
            ...(babel
              ? [
                  {
                    loader: 'babel-loader',
                    options: {
                      // use yarn build-example --env.noMinimize to verify that
                      // babel is properly applied to all js code, including the
                      // render function compiled from SFC templates.
                      presets: ['@babel/preset-env'],
                    },
                  },
                ]
              : []),
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
