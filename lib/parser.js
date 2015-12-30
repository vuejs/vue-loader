var parse5 = require('parse5')
var parser = new parse5.Parser(null, { locationInfo: true })
var cache = require('lru-cache')(100)
var SourceMapGenerator = require('source-map').SourceMapGenerator
var splitRE = /\r?\n/g
var trimRE = /^(\s|\r?\n)+/
var hash = require('hash-sum')

module.exports = function (content, filename) {

  var cacheKey = hash(filename + content)
  // source-map cache busting for hot-reloadded modules
  var filenameWithHash = filename + '?' + cacheKey
  var output = cache.get(cacheKey)
  if (output) return output

  output = {
    template: [],
    style: [],
    script: [],
    styleImports: []
  }

  var fragment = parser.parseFragment(content)

  fragment.childNodes.forEach(function (node) {
    var type = node.tagName
    var lang = getAttribute(node, 'lang')
    var src = getAttribute(node, 'src')
    var scoped = getAttribute(node, 'scoped') != null

    // node count check
    if (
      (type === 'script' || type === 'template') &&
      output[type].length > 0
    ) {
      throw new Error(
        '[vue-loader] Only one <script> or <template> tag is ' +
        'allowed inside a Vue component.'
      )
    }

    // handle src imports
    if (src) {
      if (type === 'style') {
        output.styleImports.push({
          src: src,
          lang: lang,
          scoped: scoped
        })
      } else if (type === 'template') {
        output.template.push({
          src: src,
          lang: lang
        })
      } else if (type === 'script') {
        output.script.push({
          src: src,
          lang: lang
        })
      }
      return
    }

    if (!node.childNodes || !node.childNodes.length) {
      return
    }

    if (!output[type]) {
      return
    }

    // Work around changes in parse5 >= 1.2.0
    if (node.childNodes[0].nodeName === '#document-fragment') {
      node = node.childNodes[0]
      if (!node.childNodes.length) {
        return
      }
    }

    var start = node.childNodes[0].__location.start
    var end = node.childNodes[node.childNodes.length - 1].__location.end
    var result = content.slice(start, end)
    var trimmedResult = result.replace(trimRE, '')
    var trimmed = trimmedResult.length - result.length
    var lineOffset = content.slice(0, start + trimmed).split(splitRE).length
    var map = new SourceMapGenerator()
    map.setSourceContent(filenameWithHash, content)

    trimmedResult.split(splitRE).forEach(function (line, index) {
      map.addMapping({
        source: filenameWithHash,
        original: {
          line: index + 1 + lineOffset,
          column: 0
        },
        generated: {
          line: index + 1,
          column: 0
        }
      })
    })

    output[type].push({
      lang: lang,
      scoped: scoped,
      content: trimmedResult,
      map: map.toJSON()
    })
  })

  cache.set(cacheKey, output)
  return output
}

function getAttribute (node, name) {
  if (node.attrs) {
    var i = node.attrs.length
    var attr
    while (i--) {
      attr = node.attrs[i]
      if (attr.name === name) {
        return attr.value
      }
    }
  }
}
