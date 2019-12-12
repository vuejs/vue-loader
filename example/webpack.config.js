const path = require('path')
const VueLoaderPlugin = require('../dist/plugin')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  devServer: {
    stats: "minimal",
    contentBase: __dirname
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  resolve: {
    alias: {
      'vue': '@vue/runtime-dom'
    }
  },
  resolveLoader: {
    alias: {
      'vue-loader': require.resolve('../')
    }
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
