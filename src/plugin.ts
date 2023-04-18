import webpack from 'webpack'
import type { Compiler } from 'webpack'

declare class VueLoaderPlugin {
  static NS: string
  apply(compiler: Compiler): void
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
