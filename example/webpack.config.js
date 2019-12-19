const fs = require('fs')
const path = require('path')
const hash = require('hash-sum')
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
      filename: '[name].js',
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
          use: [
            {
              loader: 'cache-loader',
              options: {
                cacheIdentifier: hash(
                  fs.readFileSync(path.resolve(__dirname, '../package.json')) +
                    JSON.stringify(env)
                )
              }
            },
            ...(babel
              ? [
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env']
                    }
                  }
                ]
              : [])
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
      minimize,
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /esm-bundler/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
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
