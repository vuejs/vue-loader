var parse5 = require('parse5')
var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2, { locationInfo: true })
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
    if (node.children[0].type === 'root') {
      node = node.children[0]
      if (!node.children.length)
        return;
    }

    var start = node.children[0].__location.start
    var end = node.children[node.children.length - 1].__location.end
    output[type][lang] = content.substring(start, end).trim()
  })

  cb(null, 'module.exports = ' + JSON.stringify(output))
}
