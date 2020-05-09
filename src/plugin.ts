import * as webpack from 'webpack'
type VueLoaderPlugin = webpack.Plugin & { NS: string }

let Plugin: VueLoaderPlugin

if (webpack.version && webpack.version[0] > '4') {
  // webpack5 and upper
  Plugin = require('./pluginWebpack5').default
} else {
  // webpack4 and lower
  Plugin = require('./pluginWebpack4')
}

export default Plugin
