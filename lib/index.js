const path = require('path')
const hash = require('hash-sum')
const qs = require('querystring')
const parse = require('./parse')
const assemble = require('./assemble')
const loaderUtils = require('loader-utils')
const compileTemplate = require('./template-compiler')

module.exports = function (source) {
  const { resourcePath, resourceQuery, target, minimize, sourceMap } = this
  const isServer = target === 'node'
  const isProduction = minimize || process.env.NODE_ENV === 'production'
  const options = loaderUtils.getOptions(this) || {}
  const fileName = path.basename(resourcePath)
  const context = this.rootContext || process.cwd()
  const sourceRoot = path.dirname(path.relative(context, resourcePath))
  const shortFilePath = path.relative(context, resourcePath).replace(/^(\.\.[\\\/])+/, '')
  const moduleId = 'data-v-' + hash(isProduction ? (shortFilePath + '\n' + content) : shortFilePath)
  const needCssSourceMap = !isProduction && sourceMap && options.cssSourceMap !== false

  const descriptor = parse(
    source,
    fileName,
    sourceRoot,
    sourceMap,
    needCssSourceMap
  )

  if (resourceQuery) {
    const query = qs.parse(resourceQuery.slice(1))

    // template
    if (query.template != null) {
      return compileTemplate(descriptor, this, moduleId)
    }

    // script
    if (query.script != null) {
      this.callback(
        null,
        descriptor.script.content,
        descriptor.script.map
      )
      return
    }

    // styles
    if (query.style != null && query.index != null) {
      return descriptor.styles[query.index].content
    }
  }

  // assemble
  return assemble(resourcePath, descriptor)
}
