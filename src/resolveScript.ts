import type { LoaderContext } from 'webpack'
import type {
  SFCDescriptor,
  SFCScriptBlock,
  TemplateCompiler,
} from 'vue/compiler-sfc'
import type { VueLoaderOptions } from 'src'
import { resolveTemplateTSOptions } from './util'
import { compiler } from './compiler'

const { compileScript } = compiler
export const clientCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()
const serverCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()

export const typeDepToSFCMap = new Map<string, Set<string>>()

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
  loaderContext: LoaderContext<VueLoaderOptions>
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

  try {
    resolved = compileScript(descriptor, {
      id: scopeId,
      isProd,
      inlineTemplate: enableInline,
      // @ts-ignore this has been removed in 3.4
      reactivityTransform: options.reactivityTransform,
      propsDestructure: options.propsDestructure,
      defineModel: options.defineModel,
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

  if (!isProd && resolved?.deps) {
    for (const [key, sfcs] of typeDepToSFCMap) {
      if (sfcs.has(descriptor.filename) && !resolved.deps.includes(key)) {
        sfcs.delete(descriptor.filename)
        if (!sfcs.size) {
          typeDepToSFCMap.delete(key)
        }
      }
    }

    for (const dep of resolved.deps) {
      const existingSet = typeDepToSFCMap.get(dep)
      if (!existingSet) {
        typeDepToSFCMap.set(dep, new Set([descriptor.filename]))
      } else {
        existingSet.add(descriptor.filename)
      }
    }
  }

  cacheToUse.set(descriptor, resolved)
  return resolved
}
