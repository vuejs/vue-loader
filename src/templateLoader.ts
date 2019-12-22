import * as webpack from 'webpack'
import qs from 'querystring'
import loaderUtils from 'loader-utils'
import { VueLoaderOptions } from './'
import { formatError } from './formatError'
import { compileTemplate } from '@vue/compiler-sfc'

// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from vue files.
const TemplateLoader: webpack.loader.Loader = function(source, inMap) {
  source = String(source)
  const loaderContext = this

  // although this is not the main vue-loader, we can get access to the same
  // vue-loader options because we've set an ident in the plugin and used that
  // ident to create the request for this loader in the pitcher.
  const options = (loaderUtils.getOptions(loaderContext) ||
    {}) as VueLoaderOptions

  // const isServer = loaderContext.target === 'node'
  // const isProduction = options.productionMode || loaderContext.minimize || process.env.NODE_ENV === 'production'
  const query = qs.parse(loaderContext.resourceQuery.slice(1))
  const scopeId = query.scoped ? `data-v-${query.id}` : null

  const compiled = compileTemplate({
    source,
    inMap,
    filename: loaderContext.resourcePath,
    compiler: options.compiler,
    compilerOptions: {
      ...options.compilerOptions,
      scopeId
    },
    transformAssetUrls: options.transformAssetUrls || true
  })

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
        formatError(
          err,
          inMap ? inMap.sourcesContent![0] : (source as string),
          loaderContext.resourcePath
        )
        loaderContext.emitError(err)
      }
    })
  }

  const { code, map } = compiled
  loaderContext.callback(null, code, map)
}

module.exports = TemplateLoader
