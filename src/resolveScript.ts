import webpack = require('webpack')
import {
  compileScript,
  SFCDescriptor,
  SFCScriptBlock,
  TemplateCompiler,
} from '@vue/compiler-sfc'
import { VueLoaderOptions } from 'src'

// since we generate different output based on whether the template is inlined
// or not, we need to cache the results separately
const inlinedCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()
const normalCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()

export function resolveScript(
  descriptor: SFCDescriptor,
  scopeId: string,
  options: VueLoaderOptions,
  loaderContext: webpack.loader.LoaderContext
) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null
  }

  const isProd = loaderContext.mode === 'production'
  const isServer = loaderContext.target === 'node'
  const templateLang = descriptor.template && descriptor.template.lang
  const enableInline = isProd && !isServer && !templateLang

  const cacheToUse = enableInline ? inlinedCache : normalCache
  const cached = cacheToUse.get(descriptor)
  if (cached) {
    return cached
  }

  let resolved: SFCScriptBlock | null = null

  let compiler: TemplateCompiler | undefined
  if (typeof options.compiler === 'string') {
    compiler = require(options.compiler)
  } else {
    compiler = options.compiler
  }

  if (compileScript) {
    try {
      resolved = compileScript(descriptor, {
        // @ts-ignore TODO remove when vue is upgraded
        scopeId,
        isProd,
        inlineTemplate: enableInline,
        babelParserPlugins: options.babelParserPlugins,
        templateOptions: {
          compiler,
          transformAssetUrls: options.transformAssetUrls || true,
        },
      })
    } catch (e) {
      loaderContext.emitError(e)
    }
  } else if (descriptor.scriptSetup) {
    loaderContext.emitError(
      `<script setup> is not supported by the installed version of ` +
        `@vue/compiler-sfc - please upgrade.`
    )
  } else {
    resolved = descriptor.script
  }

  cacheToUse.set(descriptor, resolved)
  return resolved
}
