import type { LoaderContext } from 'webpack'
import * as path from 'path'
import * as crypto from 'crypto'
import * as qs from 'querystring'

import { compiler } from './compiler'
import type {
  TemplateCompiler,
  CompilerOptions,
  SFCBlock,
  SFCTemplateCompileOptions,
  SFCScriptCompileOptions,
} from 'vue/compiler-sfc'
import { selectBlock } from './select'
import { genHotReloadCode } from './hotReload'
import { genCSSModulesCode } from './cssModules'
import { formatError } from './formatError'

import VueLoaderPlugin from './plugin'
import { canInlineTemplate } from './resolveScript'
import { setDescriptor } from './descriptorCache'
import {
  getOptions,
  stringifyRequest as _stringifyRequest,
  genMatchResource,
  testWebpack5,
} from './util'

export { VueLoaderPlugin }

export interface VueLoaderOptions {
  // https://babeljs.io/docs/en/next/babel-parser#plugins
  babelParserPlugins?: SFCScriptCompileOptions['babelParserPlugins']
  transformAssetUrls?: SFCTemplateCompileOptions['transformAssetUrls']
  compiler?: TemplateCompiler | string
  compilerOptions?: CompilerOptions
  useAbsolutePath?: boolean
  /**
   * TODO remove in 3.4
   * @deprecated
   */
  reactivityTransform?: boolean

  /**
   * @experimental
   */
  propsDestructure?: boolean
  /**
   * @experimental
   */
  defineModel?: boolean

  customElement?: boolean | RegExp

  hotReload?: boolean
  exposeFilename?: boolean
  appendExtension?: boolean
  enableTsInTemplate?: boolean
  experimentalInlineMatchResource?: boolean

  isServerBuild?: boolean
}

let errorEmitted = false

const { parse } = compiler
const exportHelperPath = require.resolve('./exportHelper')

function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').substring(0, 8)
}

export default function loader(
  this: LoaderContext<VueLoaderOptions>,
  source: string
) {
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

  const stringifyRequest = (r: string) => _stringifyRequest(loaderContext, r)

  const {
    mode,
    target,
    sourceMap,
    rootContext,
    resourcePath,
    resourceQuery: _resourceQuery = '',
    _compiler,
  } = loaderContext

  const isWebpack5 = testWebpack5(_compiler)
  const rawQuery = _resourceQuery.slice(1)
  const incomingQuery = qs.parse(rawQuery)
  const resourceQuery = rawQuery ? `&${rawQuery}` : ''
  const options = (getOptions(loaderContext) || {}) as VueLoaderOptions
  const enableInlineMatchResource =
    isWebpack5 && Boolean(options.experimentalInlineMatchResource)

  const isServer = options.isServerBuild ?? target === 'node'
  const isProduction =
    mode === 'production' || process.env.NODE_ENV === 'production'

  const filename = resourcePath.replace(/\?.*$/, '')

  const { descriptor, errors } = parse(source, {
    filename,
    sourceMap,
    templateParseOptions: options.compilerOptions,
  })

  const asCustomElement =
    typeof options.customElement === 'boolean'
      ? options.customElement
      : (options.customElement || /\.ce\.vue$/).test(filename)

  // cache descriptor
  setDescriptor(filename, descriptor)

  if (errors.length) {
    errors.forEach((err) => {
      formatError(err, source, resourcePath)
      loaderContext.emitError(err)
    })
    return ``
  }

  // module id for scoped CSS & hot-reload
  const rawShortFilePath = path
    .relative(rootContext || process.cwd(), filename)
    .replace(/^(\.\.[\/\\])+/, '')
  const shortFilePath = rawShortFilePath.replace(/\\/g, '/')
  const id = hash(
    isProduction
      ? shortFilePath + '\n' + source.replace(/\r\n/g, '\n')
      : shortFilePath
  )

  // if the query has a type field, this is a language block request
  // e.g. foo.vue?type=template&id=xxxxx
  // and we will return early
  if (incomingQuery.type) {
    return selectBlock(
      descriptor,
      id,
      options,
      loaderContext,
      incomingQuery,
      !!options.appendExtension
    )
  }

  // feature information
  const hasScoped = descriptor.styles.some((s) => s.scoped)
  const needsHotReload =
    !isServer &&
    !isProduction &&
    !!(descriptor.script || descriptor.scriptSetup || descriptor.template) &&
    options.hotReload !== false

  // extra properties to attach to the script object
  // we need to do this in a tree-shaking friendly manner
  const propsToAttach: [string, string][] = []

  // script
  let scriptImport = `const script = {}`
  let isTS = false
  const { script, scriptSetup } = descriptor
  if (script || scriptSetup) {
    const lang = script?.lang || scriptSetup?.lang
    isTS = !!(lang && /tsx?/.test(lang))
    const externalQuery = Boolean(script && !scriptSetup && script.src)
      ? `&external`
      : ``
    const src = (script && !scriptSetup && script.src) || resourcePath
    const attrsQuery = attrsToQuery((scriptSetup || script)!.attrs, 'js')
    const query = `?vue&type=script${attrsQuery}${resourceQuery}${externalQuery}`

    let scriptRequest: string

    if (enableInlineMatchResource) {
      scriptRequest = stringifyRequest(
        genMatchResource(this, src, query, lang || 'js')
      )
    } else {
      scriptRequest = stringifyRequest(src + query)
    }

    scriptImport =
      `import script from ${scriptRequest}\n` +
      // support named exports
      `export * from ${scriptRequest}`
  }

  // template
  let templateImport = ``
  let templateRequest
  const renderFnName = isServer ? `ssrRender` : `render`
  const useInlineTemplate = canInlineTemplate(descriptor, isProduction)
  if (descriptor.template && !useInlineTemplate) {
    const src = descriptor.template.src || resourcePath
    const externalQuery = Boolean(descriptor.template.src) ? `&external` : ``
    const idQuery = `&id=${id}`
    const scopedQuery = hasScoped ? `&scoped=true` : ``
    const attrsQuery = attrsToQuery(descriptor.template.attrs)
    const tsQuery =
      options.enableTsInTemplate !== false && isTS ? `&ts=true` : ``
    const query = `?vue&type=template${idQuery}${scopedQuery}${tsQuery}${attrsQuery}${resourceQuery}${externalQuery}`

    if (enableInlineMatchResource) {
      templateRequest = stringifyRequest(
        genMatchResource(
          this,
          src,
          query,
          options.enableTsInTemplate !== false && isTS ? 'ts' : 'js'
        )
      )
    } else {
      templateRequest = stringifyRequest(src + query)
    }

    templateImport = `import { ${renderFnName} } from ${templateRequest}`
    propsToAttach.push([renderFnName, renderFnName])
  }

  // styles
  let stylesCode = ``
  let hasCSSModules = false
  const nonWhitespaceRE = /\S+/
  if (descriptor.styles.length) {
    descriptor.styles
      .filter((style) => style.src || nonWhitespaceRE.test(style.content))
      .forEach((style, i) => {
        const src = style.src || resourcePath
        const attrsQuery = attrsToQuery(style.attrs, 'css')
        const lang = String(style.attrs.lang || 'css')
        // make sure to only pass id when necessary so that we don't inject
        // duplicate tags when multiple components import the same css file
        const idQuery = !style.src || style.scoped ? `&id=${id}` : ``
        const inlineQuery = asCustomElement ? `&inline` : ``
        const externalQuery = Boolean(style.src) ? `&external` : ``
        const query = `?vue&type=style&index=${i}${idQuery}${inlineQuery}${attrsQuery}${resourceQuery}${externalQuery}`

        let styleRequest
        if (enableInlineMatchResource) {
          styleRequest = stringifyRequest(
            genMatchResource(this, src, query, lang)
          )
        } else {
          styleRequest = stringifyRequest(src + query)
        }

        if (style.module) {
          if (asCustomElement) {
            loaderContext.emitError(
              new Error(
                `<style module> is not supported in custom element mode.`
              )
            )
          }
          if (!hasCSSModules) {
            stylesCode += `\nconst cssModules = {}`
            propsToAttach.push([`__cssModules`, `cssModules`])
            hasCSSModules = true
          }
          stylesCode += genCSSModulesCode(
            id,
            i,
            styleRequest,
            style.module,
            needsHotReload
          )
        } else {
          if (asCustomElement) {
            stylesCode += `\nimport _style_${i} from ${styleRequest}`
          } else {
            stylesCode += `\nimport ${styleRequest}`
          }
        }
        // TODO SSR critical CSS collection
      })
    if (asCustomElement) {
      propsToAttach.push([
        `styles`,
        `[${descriptor.styles.map((_, i) => `_style_${i}`)}]`,
      ])
    }
  }

  let code = [templateImport, scriptImport, stylesCode]
    .filter(Boolean)
    .join('\n')

  // attach scope Id for runtime use
  if (hasScoped) {
    propsToAttach.push([`__scopeId`, `"data-v-${id}"`])
  }

  // Expose filename. This is used by the devtools and Vue runtime warnings.
  if (!isProduction) {
    // Expose the file's full path in development, so that it can be opened
    // from the devtools.
    const base = options.useAbsolutePath ? filename : rawShortFilePath
    propsToAttach.push([`__file`, JSON.stringify(base.replace(/\\/g, '/'))])
  } else if (options.exposeFilename) {
    // Libraries can opt-in to expose their components' filenames in production builds.
    // For security reasons, only expose the file's basename in production.
    propsToAttach.push([`__file`, JSON.stringify(path.basename(resourcePath))])
  }

  // custom blocks
  if (descriptor.customBlocks && descriptor.customBlocks.length) {
    code += `\n/* custom blocks */\n`
    code +=
      descriptor.customBlocks
        .map((block, i) => {
          const src = block.attrs.src || resourcePath
          const attrsQuery = attrsToQuery(block.attrs)
          const blockTypeQuery = `&blockType=${qs.escape(block.type)}`
          const issuerQuery = block.attrs.src
            ? `&issuerPath=${qs.escape(resourcePath)}`
            : ''

          const externalQuery = Boolean(block.attrs.src) ? `&external` : ``
          const query = `?vue&type=custom&index=${i}${blockTypeQuery}${issuerQuery}${attrsQuery}${resourceQuery}${externalQuery}`

          let customRequest

          if (enableInlineMatchResource) {
            customRequest = stringifyRequest(
              genMatchResource(
                this,
                src as string,
                query,
                block.attrs.lang as string
              )
            )
          } else {
            customRequest = stringifyRequest(src + query)
          }

          return (
            `import block${i} from ${customRequest}\n` +
            `if (typeof block${i} === 'function') block${i}(script)`
          )
        })
        .join(`\n`) + `\n`
  }

  // finalize
  if (!propsToAttach.length) {
    code += `\n\nconst __exports__ = script;`
  } else {
    code += `\n\nimport exportComponent from ${stringifyRequest(
      exportHelperPath
    )}`
    code += `\nconst __exports__ = /*#__PURE__*/exportComponent(script, [${propsToAttach
      .map(([key, val]) => `['${key}',${val}]`)
      .join(',')}])`
  }

  if (needsHotReload) {
    code += genHotReloadCode(id, templateRequest)
  }

  code += `\n\nexport default __exports__`
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
