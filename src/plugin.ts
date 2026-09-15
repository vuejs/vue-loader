import type { Compiler } from 'webpack'
declare class VueLoaderPlugin {
  static NS: string
  apply(compiler: Compiler): void
}

const NS = 'vue-loader'

class Plugin {
  static NS = NS
  apply(compiler: Compiler) {
    new (require('./pluginWebpack5').default as typeof VueLoaderPlugin)().apply(
      compiler
    )
  }
}

export default Plugin
