import webpack = require('webpack')
declare class VueLoaderPlugin implements webpack.Plugin {
  static NS: string
  apply(compiler: webpack.Compiler): void
}

let Plugin: typeof VueLoaderPlugin

if (webpack.version && webpack.version[0] > '4') {
  // webpack5 and upper
  Plugin = require('./pluginWebpack5').default
} else {
  // webpack4 and lower
  Plugin = require('./pluginWebpack4').default
}

export default Plugin
