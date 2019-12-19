const path = require('path')
const VueLoaderPlugin = require('../dist/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env = {}) => {
  const isProd = env.prod
  const minimize = isProd && !env.noMinimize
  const babel = isProd && !env.noBabel

  return {
    mode: isProd ? 'production' : 'development',
    entry: path.resolve(__dirname, './main.js'),
    devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/dist/'
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: !isProd
              }
            },
            'css-loader'
          ]
        },
        {
          test: /\.js$/,
          use: babel
            ? {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            : [
                /* skip babel */
              ]
        },
        // target <docs> custom blocks
        {
          resourceQuery: /blockType=docs/,
          loader: require.resolve('./docs-loader')
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    optimization: {
      minimize
    },
    devServer: {
      stats: 'minimal',
      contentBase: __dirname,
      overlay: true
    },
    resolveLoader: {
      alias: {
        'vue-loader': require.resolve('../')
      }
    }
  }
}
