import { Plugin } from 'webpack'
import {
  CompilerOptions,
  parseComponent,
  compile,
  compileToFunctions,
  ssrCompile,
  ssrCompileToFunctions,
  generateCodeFrame
} from 'vue-template-compiler'

declare namespace VueLoader {
  class VueLoaderPlugin extends Plugin {}

  interface VueLoaderTemplateCompiler {
    parseComponent?: typeof parseComponent
    compile?: typeof compile
    compileToFunctions?: typeof compileToFunctions
    ssrCompile?: typeof ssrCompile
    ssrCompileToFunctions?: typeof ssrCompileToFunctions
    generateCodeFrame?: typeof generateCodeFrame
  }

  interface VueLoaderOptions {
    transformAssetUrls?: { [tag: string]: string | Array<string> }
    compiler?: VueLoaderTemplateCompiler
    compilerOptions?: CompilerOptions
    transpileOptions?: Object
    optimizeSSR?: boolean
    hotReload?: boolean
    productionMode?: boolean
    shadowMode?: boolean
    cacheDirectory?: string
    cacheIdentifier?: string
    prettify?: boolean
    exposeFilename?: boolean
  }
}

export = VueLoader
