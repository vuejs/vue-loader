import webpack = require('webpack')
import type { SFCDescriptor, CompilerOptions } from 'vue/compiler-sfc'
import type { VueLoaderOptions } from '.'
import { parseQuery } from 'loader-utils'
import * as path from 'path'

export function resolveTemplateTSOptions(
  descriptor: SFCDescriptor,
  options: VueLoaderOptions
): CompilerOptions | null {
  if (options.enableTsInTemplate === false) return null

  const lang = descriptor.script?.lang || descriptor.scriptSetup?.lang
  const isTS = !!(lang && /tsx?$/.test(lang))
  let expressionPlugins = options?.compilerOptions?.expressionPlugins || []
  if (isTS && !expressionPlugins.includes('typescript')) {
    expressionPlugins = [...expressionPlugins, 'typescript']
  }
  return {
    isTS,
    expressionPlugins,
  }
}

// loader utils removed getOptions in 3.x, but it's not available on webpack 4
// loader context
export function getOptions(loaderContext: webpack.loader.LoaderContext) {
  const query = loaderContext.query

  if (typeof query === 'string' && query !== '') {
    return parseQuery(loaderContext.query)
  }

  if (!query || typeof query !== 'object') {
    // Not object-like queries are not supported.
    return {}
  }

  return query
}

const matchRelativePath = /^\.\.?[/\\]/

function isAbsolutePath(str: string) {
  return path.posix.isAbsolute(str) || path.win32.isAbsolute(str)
}

function isRelativePath(str: string) {
  return matchRelativePath.test(str)
}

export function stringifyRequest(
  loaderContext: webpack.loader.LoaderContext,
  request: string
) {
  const splitted = request.split('!')
  const context =
    loaderContext.context ||
    // @ts-ignore
    (loaderContext.options && loaderContext.options.context)

  return JSON.stringify(
    splitted
      .map((part) => {
        // First, separate singlePath from query, because the query might contain paths again
        const splittedPart = part.match(/^(.*?)(\?.*)/)
        const query = splittedPart ? splittedPart[2] : ''
        let singlePath = splittedPart ? splittedPart[1] : part

        if (isAbsolutePath(singlePath) && context) {
          singlePath = path.relative(context, singlePath)

          if (isAbsolutePath(singlePath)) {
            // If singlePath still matches an absolute path, singlePath was on a different drive than context.
            // In this case, we leave the path platform-specific without replacing any separators.
            // @see https://github.com/webpack/loader-utils/pull/14
            return singlePath + query
          }

          if (isRelativePath(singlePath) === false) {
            // Ensure that the relative path starts at least with ./ otherwise it would be a request into the modules directory (like node_modules).
            singlePath = './' + singlePath
          }
        }

        return singlePath.replace(/\\/g, '/') + query
      })
      .join('!')
  )
}
