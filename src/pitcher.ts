import type { LoaderDefinitionFunction, LoaderContext } from 'webpack'
import * as qs from 'querystring'
import { getOptions, stringifyRequest, testWebpack5 } from './util'
import { VueLoaderOptions } from '.'

const selfPath = require.resolve('./index')
// const templateLoaderPath = require.resolve('./templateLoader')
const stylePostLoaderPath = require.resolve('./stylePostLoader')
const styleInlineLoaderPath = require.resolve('./styleInlineLoader')

// @types/webpack doesn't provide the typing for loaderContext.loaders...
type Loader = LoaderContext<VueLoaderOptions>['loaders'][number]

const isESLintLoader = (l: Loader) => /(\/|\\|@)eslint-loader/.test(l.path)
const isNullLoader = (l: Loader) => /(\/|\\|@)null-loader/.test(l.path)
const isCSSLoader = (l: Loader) => /(\/|\\|@)css-loader/.test(l.path)
const isCacheLoader = (l: Loader) => /(\/|\\|@)cache-loader/.test(l.path)
const isNotPitcher = (l: Loader) => l.path !== __filename

const pitcher: LoaderDefinitionFunction = (code) => code

// This pitching loader is responsible for intercepting all vue block requests
// and transform it into appropriate requests.
export const pitch = function () {
  const context = this as LoaderContext<VueLoaderOptions>
  const rawLoaders = context.loaders.filter(isNotPitcher)
  let loaders = rawLoaders

  // do not inject if user uses null-loader to void the type (#1239)
  if (loaders.some(isNullLoader)) {
    return
  }

  const query = qs.parse(context.resourceQuery.slice(1))
  const isInlineBlock = /\.vue$/.test(context.resourcePath)
  // eslint-loader may get matched multiple times
  // if this is an inline block, since the whole file itself is being linted,
  // remove eslint-loader to avoid duplicate linting.
  if (isInlineBlock) {
    loaders = loaders.filter((l: Loader) => !isESLintLoader(l))
  }

  // Important: dedupe loaders since both the original rule
  // and the cloned rule would match a source import request or a
  // resourceQuery-only rule that intends to target a custom block with no lang
  const seen = new Map()
  loaders = loaders.filter((loader) => {
    const identifier =
      typeof loader === 'string'
        ? loader
        : // Dedupe based on both path and query if available. This is important
          // in Vue CLI so that postcss-loaders with different options can co-exist
          loader.path + loader.query
    if (!seen.has(identifier)) {
      seen.set(identifier, true)
      return true
    }
  })

  // Inject style-post-loader before css-loader for scoped CSS and trimming
  const isWebpack5 = testWebpack5(context._compiler)
  const options = (getOptions(context) || {}) as VueLoaderOptions
  if (query.type === `style`) {
    if (isWebpack5 && context._compiler?.options.experiments.css) {
      // If user enables `experiments.css`, then we are trying to emit css code directly.
      // Although we can target requests like `xxx.vue?type=style` to match `type: "css"`,
      // it will make the plugin a mess.
      if (!options.experimentalInlineMatchResource) {
        context.emitError(
          new Error(
            '`experimentalInlineMatchResource` should be enabled if `experiments.css` enabled currently'
          )
        )
        return ''
      }

      if (query.inline || query.module) {
        context.emitError(
          new Error(
            '`inline` or `module` is currently not supported with `experiments.css` enabled'
          )
        )
        return ''
      }

      const loaderString = [stylePostLoaderPath, ...loaders]
        .map((loader) => {
          return typeof loader === 'string' ? loader : loader.request
        })
        .join('!')
      const styleRequest = stringifyRequest(
        context,
        `${context.resourcePath}${query.lang ? `.${query.lang}` : ''}${
          context.resourceQuery
        }!=!-!${loaderString}!${context.resource}`
      )
      return `@import ${styleRequest};`
    }
    const cssLoaderIndex = loaders.findIndex(isCSSLoader)
    if (cssLoaderIndex > -1) {
      // if inlined, ignore any loaders after css-loader and replace w/ inline
      // loader
      const afterLoaders =
        query.inline != null
          ? [styleInlineLoaderPath]
          : loaders.slice(0, cssLoaderIndex + 1)
      const beforeLoaders = loaders.slice(cssLoaderIndex + 1)

      const { namedExport = false } = // @ts-ignore
        loaders[cssLoaderIndex]?.options?.modules || {}

      return genProxyModule(
        [...afterLoaders, stylePostLoaderPath, ...beforeLoaders],
        context,
        !!query.module || query.inline != null,
        (query.lang as string) || 'css',
        namedExport
      )
    }
  }

  // if a custom block has no other matching loader other than vue-loader itself
  // or cache-loader, we should ignore it
  if (query.type === `custom` && shouldIgnoreCustomBlock(loaders)) {
    return ``
  }

  // Rewrite request. Technically this should only be done when we have deduped
  // loaders. But somehow this is required for block source maps to work.
  return genProxyModule(
    loaders,
    context,
    query.type !== 'template',
    query.ts ? 'ts' : (query.lang as string)
  )
}

function genProxyModule(
  loaders: (Loader | string)[],
  context: LoaderContext<VueLoaderOptions>,
  exportDefault = true,
  lang = 'js',
  cssNamedExport = false
) {
  const request = genRequest(loaders, lang, context)
  // return a proxy module which simply re-exports everything from the
  // actual request. Note for template blocks the compiled module has no
  // default export.
  return (
    (exportDefault && !cssNamedExport
      ? `export { default } from ${request}; `
      : ``) + `export * from ${request}`
  )
}

function genRequest(
  loaders: (Loader | string)[],
  lang: string,
  context: LoaderContext<VueLoaderOptions>
) {
  const isWebpack5 = testWebpack5(context._compiler)
  const options = (getOptions(context) || {}) as VueLoaderOptions
  const enableInlineMatchResource =
    isWebpack5 && options.experimentalInlineMatchResource

  const loaderStrings = loaders.map((loader) => {
    return typeof loader === 'string' ? loader : loader.request
  })
  const resource = context.resourcePath + context.resourceQuery

  if (enableInlineMatchResource) {
    return stringifyRequest(
      context,
      `${context.resourcePath}${lang ? `.${lang}` : ''}${
        context.resourceQuery
      }!=!-!${[...loaderStrings, resource].join('!')}`
    )
  }

  return stringifyRequest(
    context,
    '-!' + [...loaderStrings, resource].join('!')
  )
}

function shouldIgnoreCustomBlock(loaders: Loader[]) {
  const actualLoaders = loaders.filter((loader) => {
    // vue-loader
    if (loader.path === selfPath) {
      return false
    }
    // cache-loader
    if (isCacheLoader(loader)) {
      return false
    }
    return true
  })
  return actualLoaders.length === 0
}

export default pitcher
