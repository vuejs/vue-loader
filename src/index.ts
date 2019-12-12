import * as webpack from 'webpack'
import path from 'path'
import qs from 'querystring'
import hash from 'hash-sum'
import loaderUtils from 'loader-utils'
import {
  parse,
  TemplateCompiler,
  CompilerOptions,
  SFCBlock,
  TemplateCompileOptions
} from '@vue/compiler-sfc'
import { selectBlock } from './select'
import { genHotReloadCode } from './hotReload'

const VueLoaderPlugin = require('./plugin')

export interface VueLoaderOptions {
  transformAssetUrls?: TemplateCompileOptions['transformAssetUrls']
  compiler?: TemplateCompiler
  compilerOptions?: CompilerOptions
  hotReload?: boolean
  productionMode?: boolean
  cacheDirectory?: string
  cacheIdentifier?: string
  exposeFilename?: boolean
  appendExtension?: boolean
}

let errorEmitted = false

const loader: webpack.loader.Loader = function(source) {
  const loaderContext = this

  // check if plugin is installed
  if (
    !errorEmitted &&
    !(loaderContext as any)['thread-loader'] &&
    !(loaderContext as any)[VueLoaderPlugin.NS]
  ) {
    loaderContext.emitError(
      new Error(
        `vue-loader was used without the corresponding plugin. ` +
          `Make sure to include VueLoaderPlugin in your webpack config.`
      )
    )
    errorEmitted = true
  }

  const stringifyRequest = (r: string) =>
    loaderUtils.stringifyRequest(loaderContext, r)

  const {
    target,
    minimize,
    sourceMap,
    rootContext,
    resourcePath,
    resourceQuery
  } = loaderContext

  const rawQuery = resourceQuery.slice(1)
  const inheritQuery = `&${rawQuery}`
  const incomingQuery = qs.parse(rawQuery)
  const options = (loaderUtils.getOptions(loaderContext) ||
    {}) as VueLoaderOptions

  const isServer = target === 'node'
  const isProduction =
    options.productionMode || minimize || process.env.NODE_ENV === 'production'

  const filename = path.basename(resourcePath)
  const context = rootContext || process.cwd()
  const sourceRoot = path.dirname(path.relative(context, resourcePath))

  const descriptor = parse(String(source), {
    filename,
    sourceMap,
    sourceRoot
  })

  // if the query has a type field, this is a language block request
  // e.g. foo.vue?type=template&id=xxxxx
  // and we will return early
  if (incomingQuery.type) {
    return selectBlock(
      descriptor,
      loaderContext,
      incomingQuery,
      !!options.appendExtension
    )
  }

  // module id for scoped CSS & hot-reload
  const rawShortFilePath = path
    .relative(context, resourcePath)
    .replace(/^(\.\.[\/\\])+/, '')
  const shortFilePath = rawShortFilePath.replace(/\\/g, '/') + resourceQuery
  const id = hash(isProduction ? shortFilePath + '\n' + source : shortFilePath)

  // feature information
  const hasScoped = descriptor.styles.some(s => s.scoped)
  const needsHotReload =
    !isServer &&
    !isProduction &&
    (descriptor.script || descriptor.template) &&
    options.hotReload !== false

  // template
  let templateImport = `const render = () => {}`
  let templateRequest
  if (descriptor.template) {
    const src = descriptor.template.src || resourcePath
    const idQuery = `&id=${id}`
    const scopedQuery = hasScoped ? `&scoped=true` : ``
    const attrsQuery = attrsToQuery(descriptor.template.attrs)
    const query = `?vue&type=template${idQuery}${scopedQuery}${attrsQuery}${inheritQuery}`
    const request = (templateRequest = stringifyRequest(src + query))
    templateImport = `import render from ${request}`
  }

  // script
  let scriptImport = `const script = {}`
  if (descriptor.script) {
    const src = descriptor.script.src || resourcePath
    const attrsQuery = attrsToQuery(descriptor.script.attrs, 'js')
    const query = `?vue&type=script${attrsQuery}${inheritQuery}`
    const request = stringifyRequest(src + query)
    scriptImport =
      `import script from ${request}\n` + `export * from ${request}` // support named exports
  }

  // styles
  let stylesCode = ``
  if (descriptor.styles.length) {
    // TODO handle style
  }

  let code = [
    templateImport,
    scriptImport,
    stylesCode,
    `script.render = render`
  ].join('\n')

  if (descriptor.customBlocks && descriptor.customBlocks.length) {
    // TODO custom blocks
  }

  if (needsHotReload) {
    code += `\nscript.__hmrId = "${id}"`
    code += genHotReloadCode(id, templateRequest)
  }

  // Expose filename. This is used by the devtools and Vue runtime warnings.
  if (!isProduction) {
    // Expose the file's full path in development, so that it can be opened
    // from the devtools.
    code += `\nscript.__file = ${JSON.stringify(
      rawShortFilePath.replace(/\\/g, '/')
    )}`
  } else if (options.exposeFilename) {
    // Libraies can opt-in to expose their components' filenames in production builds.
    // For security reasons, only expose the file's basename in production.
    code += `\nscript.__file = ${JSON.stringify(filename)}`
  }

  // finalize
  code += `\n\nexport default script`
  return code
}

// these are built-in query parameters so should be ignored
// if the user happen to add them as attrs
const ignoreList = ['id', 'index', 'src', 'type']

function attrsToQuery(attrs: SFCBlock['attrs'], langFallback?: string): string {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${qs.escape(name)}=${value ? qs.escape(String(value)) : ``}`
    }
  }
  if (langFallback && !(`lang` in attrs)) {
    query += `&lang=${langFallback}`
  }
  return query
}

;(loader as any).VueLoaderPlugin = VueLoaderPlugin
module.exports = loader
