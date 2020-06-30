import webpack from 'webpack'
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

  // Load compiler options from template 'compiler' attribute.
  let compilerOptions = options.compilerOptions
  let compiler = options.compiler

  const compilerName = query.compiler
  if (compilerName) {
    if (Array.isArray(compilerName)) {
      loaderContext.emitError(
        new Error('You can only specify the compiler attribute once!')
      )
    } else if (
      !options.templateCompilers ||
      !options.templateCompilers[compilerName]
    ) {
      loaderContext.emitError(
        new Error(`In your webpack config, specify the vue rule:
        {
          test: /\\.vue$/,
          use: {
            loader: 'vue-loader',
            options: {
              templateCompilers: {
                ${compilerName}: [require('${compilerName}'), {}]
              }
            }
          }
        }`)
      )
    } else {
      const info = options.templateCompilers[compilerName]
      if (Array.isArray(info)) {
        compiler = info[0]
        compilerOptions = info[1] || {}
      } else {
        compiler = info
        compilerOptions = {}
      }
    }
  }

  const compiled = compileTemplate({
    source,
    inMap,
    filename: loaderContext.resourcePath,
    compiler: compiler,
    compilerOptions: {
      ...compilerOptions,
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

export default TemplateLoader
