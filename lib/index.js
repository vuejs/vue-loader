const path = require('path')
const hash = require('hash-sum')
const parse = require('./parse')
const qs = require('querystring')
const plugin = require('./plugin')
const selectBlock = require('./select')
const loaderUtils = require('loader-utils')
const { genHotReloadCode } = require('./hotReload')
const genStyleInjectionCode = require('./styleInjection')
const componentNormalizerPath = require.resolve('./runtime/componentNormalizer')

module.exports = function (source) {
  const loaderContext = this
  const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r)

  const {
    target,
    request,
    minimize,
    sourceMap,
    rootContext,
    resourcePath,
    resourceQuery
  } = loaderContext

  const incomingQuery = qs.parse(resourceQuery.slice(1))
  const options = loaderUtils.getOptions(loaderContext) || {}

  const isServer = target === 'node'
  const isShadow = incomingQuery.shadow != null
  const isProduction = minimize || process.env.NODE_ENV === 'production'
  const fileName = path.basename(resourcePath)
  const context = rootContext || process.cwd()
  const sourceRoot = path.dirname(path.relative(context, resourcePath))

  const descriptor = parse(
    source,
    fileName,
    sourceRoot,
    sourceMap
  )

  // if the query has a type field, this is a language block request
  // e.g. foo.vue?type=template&id=xxxxx
  // and we will return early
  if (incomingQuery.type) {
    return selectBlock(descriptor, loaderContext, incomingQuery)
  }

  // module id for scoped CSS & hot-reload
  const shortFilePath = path
    .relative(context, resourcePath)
    .replace(/^(\.\.[\\\/])+/, '')
  const id = hash(
    isProduction
      ? (shortFilePath + '\n' + source)
      : shortFilePath
  )

  // feature information
  const hasScoped = descriptor.styles.some(s => s.scoped)
  const templateAttrs = (descriptor.template && descriptor.template.attrs) || {}
  const hasFunctional = templateAttrs.functional
  const hasComment = templateAttrs.comments
  const needsHotReload = (
    !isServer &&
    !isProduction &&
    (descriptor.script || descriptor.template) &&
    options.hotReload !== false
  )

  // template
  let templateImport = `var render, staticRenderFns`
  if (descriptor.template) {
    const src = descriptor.template.src || resourcePath
    const langQuery = getLangQuery(descriptor.template)
    const idQuery = hasScoped ? `&id=${id}` : ``
    const fnQuery = hasFunctional ? `&functional` : ``
    const commentQuery = hasComment ? `&comment` : ``
    const query = `?vue&type=template${idQuery}${langQuery}${fnQuery}${commentQuery}`
    const request = stringifyRequest(src + query)
    templateImport = `import { render, staticRenderFns } from ${request}`
  }

  // script
  let scriptImport = `var script = {}`
  if (descriptor.script) {
    const src = descriptor.script.src || resourcePath
    const langQuery = getLangQuery(descriptor.script, 'js')
    const query = `?vue&type=script${langQuery}`
    const request = stringifyRequest(src + query)
    scriptImport = (
      `import script from ${request}\n` +
      `export * from ${request}` // support named exports
    )
  }

  // styles
  let styleInjectionCode = ``
  if (descriptor.styles.length) {
    styleInjectionCode = genStyleInjectionCode(
      loaderContext,
      descriptor.styles,
      id,
      resourcePath,
      stringifyRequest,
      getLangQuery,
      needsHotReload,
      isServer || isShadow // needs explicit injection?
    )
  }

  let code = `
${templateImport}
${scriptImport}
${styleInjectionCode}
import normalizer from ${stringifyRequest(`!${componentNormalizerPath}`)}
var component = normalizer(
  script,
  render,
  staticRenderFns,
  ${hasFunctional ? `true` : `false`},
  ${/injectStyles/.test(styleInjectionCode) ? `injectStyles` : `null`},
  ${hasScoped ? JSON.stringify(id) : `null`},
  ${isServer ? JSON.stringify(hash(request)) : `null`}
  ${isShadow ? `,true` : ``}
)
  `.trim()

  if (descriptor.customBlocks && descriptor.customBlocks.length) {
    // TODO custom blocks
  }

  // Expose filename. This is used by the devtools and vue runtime warnings.
  if (!isProduction) {
    code += `\ncomponent.options.__file = ${JSON.stringify(shortFilePath)}`
  }

  if (needsHotReload) {
    code += genHotReloadCode(id, hasFunctional)
  }

  code += `\nexport default component.exports`
  // console.log(code)
  return code
}

function getLangQuery (block, fallback) {
  const lang = block.lang || fallback
  return lang ? `&lang=${lang}` : ``
}

module.exports.VueLoaderPlugin = plugin
