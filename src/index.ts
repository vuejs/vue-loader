import * as webpack from 'webpack'
import { TemplateCompiler, CompilerOptions } from '@vue/compiler-sfc'

export interface VueLoaderOptions {
  transformAssetUrls?: { [tag: string]: string | Array<string> }
  compiler?: TemplateCompiler
  compilerOptions?: CompilerOptions
  hotReload?: boolean
  productionMode?: boolean
  cacheDirectory?: string
  cacheIdentifier?: string
  exposeFilename?: boolean
}

const vueLoader: webpack.loader.Loader = function (source) {
  const loaderContext = this
}

export default vueLoader
