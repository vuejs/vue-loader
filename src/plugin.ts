import type { Compiler } from 'webpack'
import { testWebpack5 } from './util'

declare class VueLoaderPlugin {
  static NS: string
  apply(compiler: Compiler): void
}

const NS = 'vue-loader'

class Plugin {
  static NS = NS
  apply(compiler: Compiler) {
    let Ctor: typeof VueLoaderPlugin
    if (testWebpack5(compiler)) {
      // webpack5 and upper
      Ctor = require('./pluginWebpack5').default
    } else {
      // webpack4 and lower
      Ctor = require('./pluginWebpack4').default
    }
    new Ctor().apply(compiler)
  }
}

export default Plugin
