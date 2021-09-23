import webpack = require('webpack')
import type {
  SFCDescriptor,
  SFCScriptBlock,
  TemplateCompiler,
} from '@vue/compiler-sfc'
import type { VueLoaderOptions } from 'src'
import { resolveTemplateTSOptions } from './util'
import { compiler } from './compiler'

const clientCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()
const serverCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()

/**
 * inline template mode can only be enabled if:
 * - is production (separate compilation needed for HMR during dev)
 * - template has no pre-processor (separate loader chain required)
 * - template is not using src
 */
export function canInlineTemplate(descriptor: SFCDescriptor, isProd: boolean) {
  const templateLang = descriptor.template && descriptor.template.lang
  const templateSrc = descriptor.template && descriptor.template.src
  return isProd && !!descriptor.scriptSetup && !templateLang && !templateSrc
}

export function resolveScript(
  descriptor: SFCDescriptor,
  scopeId: string,
  options: VueLoaderOptions,
  loaderContext: webpack.loader.LoaderContext
) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null
  }

  const isProd =
    loaderContext.mode === 'production' || process.env.NODE_ENV === 'production'
  const isServer = options.isServerBuild ?? loaderContext.target === 'node'
  const enableInline = canInlineTemplate(descriptor, isProd)

  const cacheToUse = isServer ? serverCache : clientCache
  const cached = cacheToUse.get(descriptor)
  if (cached) {
    return cached
  }

  let resolved: SFCScriptBlock | null = null

  let templateCompiler: TemplateCompiler | undefined
  if (typeof options.compiler === 'string') {
    templateCompiler = require(options.compiler)
  } else {
    templateCompiler = options.compiler
  }

  if (compiler.compileScript) {
    try {
      resolved = compiler.compileScript(descriptor, {
        id: scopeId,
        isProd,
        inlineTemplate: enableInline,
        refSugar: options.refSugar,
        babelParserPlugins: options.babelParserPlugins,
        templateOptions: {
          ssr: isServer,
          compiler: templateCompiler,
          compilerOptions: {
            ...options.compilerOptions,
            ...resolveTemplateTSOptions(descriptor, options),
          },
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
