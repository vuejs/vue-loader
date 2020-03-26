const webpack = require('webpack')
let VueLoaderPlugin = null

if (webpack.version && webpack.version[0] > 4) {
  // webpack5 and upper
  VueLoaderPlugin = require('./pluginWebpack5')
} else {
  // webpack4 and lower
  VueLoaderPlugin = require('./pluginWebpack4')
}

module.exports = VueLoaderPlugin
