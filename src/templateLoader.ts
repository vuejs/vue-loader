import * as webpack from 'webpack'
import qs from 'querystring'
import loaderUtils from 'loader-utils'
import { VueLoaderOptions } from './'
import {
  compileTemplate,
  TemplateCompileOptions,
  generateCodeFrame
} from '@vue/compiler-sfc'

// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from vue files.
const TemplateLoader: webpack.loader.Loader = function(source) {
  source = String(source)
  const loaderContext = this
  const query = qs.parse(this.resourceQuery.slice(1))

  // although this is not the main vue-loader, we can get access to the same
  // vue-loader options because we've set an ident in the plugin and used that
  // ident to create the request for this loader in the pitcher.
  const options = (loaderUtils.getOptions(loaderContext) ||
    {}) as VueLoaderOptions
  const { id } = query
  // const isServer = loaderContext.target === 'node'
  // const isProduction = options.productionMode || loaderContext.minimize || process.env.NODE_ENV === 'production'

  const compilerOptions = Object.assign({}, options.compilerOptions, {
    // TODO line offset
    scopeId: query.scoped ? `data-v-${id}` : null
  })

  // for vue-component-compiler
  const finalOptions: TemplateCompileOptions = {
    source,
    filename: this.resourcePath,
    compiler: options.compiler,
    compilerOptions,
    transformAssetUrls: options.transformAssetUrls || true
  }

  const compiled = compileTemplate(finalOptions)

  // tips
  if (compiled.tips.length) {
    compiled.tips.forEach(tip => {
      loaderContext.emitWarning(tip)
    })
  }

  // errors
  if (compiled.errors && compiled.errors.length) {
    compiled.errors.forEach(err => {
      if (typeof err === 'string') {
        loaderContext.emitError(err)
      } else {
        if (err.loc) {
          err.message = `\n${err.message}\n\n${
            generateCodeFrame(
            source as string,
            err.loc.start.offset,
            err.loc.end.offset
          )}`
        }
        loaderContext.emitError(err)
      }
    })
  }

  const { code, map } = compiled
  loaderContext.callback(null, code, map as any)
}

module.exports = TemplateLoader
