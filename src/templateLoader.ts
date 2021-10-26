import webpack = require('webpack')
import * as qs from 'querystring'
import * as loaderUtils from 'loader-utils'
import { VueLoaderOptions } from './'
import { formatError } from './formatError'
import type { TemplateCompiler } from '@vue/compiler-sfc'
import { getDescriptor } from './descriptorCache'
import { resolveScript } from './resolveScript'
import { resolveTemplateTSOptions } from './util'
import { compiler } from './compiler'

// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from vue files.
const TemplateLoader: webpack.loader.Loader = function (source, inMap) {
  source = String(source)
  const loaderContext = this

  // although this is not the main vue-loader, we can get access to the same
  // vue-loader options because we've set an ident in the plugin and used that
  // ident to create the request for this loader in the pitcher.
  const options = (loaderUtils.getOptions(loaderContext) ||
    {}) as VueLoaderOptions

  const isServer = options.isServerBuild ?? loaderContext.target === 'node'
  const isProd =
    loaderContext.mode === 'production' || process.env.NODE_ENV === 'production'
  const query = qs.parse(loaderContext.resourceQuery.slice(1))
  const scopeId = query.id as string
  const descriptor = getDescriptor(loaderContext.resourcePath)
  const script = resolveScript(
    descriptor,
    query.id as string,
    options,
    loaderContext
  )

  let templateCompiler: TemplateCompiler | undefined
  if (typeof options.compiler === 'string') {
    templateCompiler = require(options.compiler)
  } else {
    templateCompiler = options.compiler
  }

  const compiled = compiler.compileTemplate({
    source,
    filename: loaderContext.resourcePath,
    inMap,
    id: scopeId,
    scoped: !!query.scoped,
    slotted: descriptor.slotted,
    isProd,
    ssr: isServer,
    ssrCssVars: descriptor.cssVars,
    compiler: templateCompiler,
    compilerOptions: {
      ...options.compilerOptions,
      scopeId: query.scoped ? `data-v-${scopeId}` : undefined,
      bindingMetadata: script ? script.bindings : undefined,
      ...resolveTemplateTSOptions(descriptor, options),
    },
    transformAssetUrls: options.transformAssetUrls || true,
  })

  // tips
  if (compiled.tips.length) {
    compiled.tips.forEach((tip) => {
      loaderContext.emitWarning(tip)
    })
  }

  // errors
  if (compiled.errors && compiled.errors.length) {
    compiled.errors.forEach((err) => {
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
