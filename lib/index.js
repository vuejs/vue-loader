const path = require('path')
const hash = require('hash-sum')
const parse = require('./parse')
const qs = require('querystring')
const plugin = require('./plugin')
const selectBlock = require('./select')
const loaderUtils = require('loader-utils')
const { genHotReloadCode } = require('./hotReload')
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

  const isServer = target === 'node'
  const isProduction = minimize || process.env.NODE_ENV === 'production'
  const options = loaderUtils.getOptions(loaderContext) || {}
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
  const incomingQuery = qs.parse(resourceQuery.slice(1))
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
  let styleImports = ``
  if (descriptor.styles.length) {
    styleImports = descriptor.styles.map((style, i) => {
      const src = style.src || resourcePath
      const langQuery = getLangQuery(style, 'css')
      const scopedQuery = style.scoped ? `&scoped&id=${id}` : ``
      const query = `?vue&type=style&index=${i}${langQuery}${scopedQuery}`
      const request = stringifyRequest(src + query)
      return `import style${i} from ${request}`
    }).join('\n')
  }

  let code = `
${templateImport}
${scriptImport}
${styleImports}
import normalizer from ${stringifyRequest(`!${componentNormalizerPath}`)}
var component = normalizer(
  script,
  render,
  staticRenderFns,
  ${hasFunctional ? `true` : `false`},
  null, // TODO style injection
  ${JSON.stringify(id)},
  ${isServer ? JSON.stringify(hash(request)) : `null`}
  ${incomingQuery.shadow ? `,true` : ``}
)
  `.trim()

  if (descriptor.customBlocks && descriptor.customBlocks.length) {
    // TODO custom blocks
  }

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
