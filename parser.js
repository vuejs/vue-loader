var parse5 = require('parse5')
var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2, { locationInfo: true })
var serializer = new parse5.TreeSerializer()
var SourceNode = require("source-map").SourceNode
var loaderUtils = require("loader-utils")

module.exports = function (content) {
  this.cacheable()
  var cb = this.async()
  var vueRequest = loaderUtils.getRemainingRequest(this)
  var request = loaderUtils.getCurrentRequest(this)

  var languages = {}
  var output = {
    template: {},
    style: {},
    script: {},
    includes: []
  }

  function pos(offset) {
    return {
      line: content.substr(0, offset).split('\n').length,
      col: offset - content.lastIndexOf('\n', offset - 1)
    }
  }

  var fragment = parser.parseFragment(content)
  fragment.children.forEach(function (node) {
    if (node.attribs && node.attribs.src) {
      output.includes.push(node.attribs.src)
      return
    }

    if (!node.children || !node.children.length)
      return

    var lang = (node.attribs && node.attribs.lang) || ''
    var type = node.name
    if (!output[type])
      return

    // Work around changes in parse5 >= 1.2.0
    if (node.children[0].type === 'root')
      node = node.children[0]

    var start = node.children[0].__location.start
    var end = node.children[node.children.length - 1].__location.end
    var lines = content.substring(start, end).split('\n')
    var startPos = pos(start)
    var sourceNodes = lines.map(function (line, i) {
      return new SourceNode(startPos.line + i, i ? 0 : startPos.col, vueRequest, line + '\n')
    })
    output[type][lang] = (output[type][lang] || []).concat(sourceNodes)
  })

  for (var type in output) {
    for (var lang in output[type]) {
      var sourceNodes = output[type][lang]
      output[type][lang] = new SourceNode(1, 1, vueRequest, sourceNodes).toStringWithSourceMap({
        file: request
      })
    }
  }

  cb(null, 'module.exports = ' + JSON.stringify(output))
}
