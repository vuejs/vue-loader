import type { Compiler, LoaderContext } from 'webpack'
import qs from 'querystring'
import type { SFCDescriptor, CompilerOptions } from 'vue/compiler-sfc'
import type { VueLoaderOptions } from '.'
import * as path from 'path'

export function needHMR(
  vueLoaderOptions: VueLoaderOptions,
  compilerOptions: Compiler['options']
) {
  const isServer =
    vueLoaderOptions.isServerBuild ?? compilerOptions.target === 'node'
  const isProduction =
    compilerOptions.mode === 'production' ||
    process.env.NODE_ENV === 'production'
  return !isServer && !isProduction && vueLoaderOptions.hotReload !== false
}

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
export function getOptions(loaderContext: LoaderContext<VueLoaderOptions>) {
  const query = loaderContext.query

  if (typeof query === 'string' && query !== '') {
    return parseQuery(query)
  }

  if (!query || typeof query !== 'object') {
    // Not object-like queries are not supported.
    return {}
  }

  return query
}

const specialValues = {
  null: null,
  true: true,
  false: false,
}

function parseQuery(query: string) {
  if (query.substr(0, 1) !== '?') {
    throw new Error(
      "A valid query string passed to parseQuery should begin with '?'"
    )
  }

  query = query.substr(1)

  if (!query) {
    return {}
  }

  if (query.substr(0, 1) === '{' && query.substr(-1) === '}') {
    return JSON.parse(query)
  }

  const queryArgs = query.split(/[,&]/g)
  const result = Object.create(null)

  queryArgs.forEach((arg) => {
    const idx = arg.indexOf('=')

    if (idx >= 0) {
      let name = arg.substr(0, idx)
      let value = decodeURIComponent(arg.substr(idx + 1))

      // eslint-disable-next-line no-prototype-builtins
      if (specialValues.hasOwnProperty(value)) {
        value = (specialValues as any)[value]
      }

      if (name.substr(-2) === '[]') {
        name = decodeURIComponent(name.substr(0, name.length - 2))

        if (!Array.isArray(result[name])) {
          result[name] = []
        }

        result[name].push(value)
      } else {
        name = decodeURIComponent(name)
        result[name] = value
      }
    } else {
      if (arg.substr(0, 1) === '-') {
        result[decodeURIComponent(arg.substr(1))] = false
      } else if (arg.substr(0, 1) === '+') {
        result[decodeURIComponent(arg.substr(1))] = true
      } else {
        result[decodeURIComponent(arg)] = true
      }
    }
  })

  return result
}

const matchRelativePath = /^\.\.?[/\\]/

function isAbsolutePath(str: string) {
  return path.posix.isAbsolute(str) || path.win32.isAbsolute(str)
}

function isRelativePath(str: string) {
  return matchRelativePath.test(str)
}

export function stringifyRequest(
  loaderContext: LoaderContext<VueLoaderOptions>,
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

export function genMatchResource(
  context: LoaderContext<VueLoaderOptions>,
  resourcePath: string,
  resourceQuery?: string,
  lang?: string
) {
  resourceQuery = resourceQuery || ''

  const loaders: string[] = []
  const parsedQuery = qs.parse(resourceQuery.slice(1))

  // process non-external resources
  if ('vue' in parsedQuery && !('external' in parsedQuery)) {
    const currentRequest = context.loaders
      .slice(context.loaderIndex)
      .map((obj) => obj.request)
    loaders.push(...currentRequest)
  }
  const loaderString = loaders.join('!')

  return `${resourcePath}${lang ? `.${lang}` : ''}${resourceQuery}!=!${
    loaderString ? `${loaderString}!` : ''
  }${resourcePath}${resourceQuery}`
}

export const testWebpack5 = (compiler?: Compiler) => {
  if (!compiler) {
    return false
  }
  const webpackVersion = compiler?.webpack?.version
  return Boolean(webpackVersion && Number(webpackVersion.split('.')[0]) > 4)
}
