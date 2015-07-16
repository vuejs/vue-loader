var parse5 = require('parse5')
var parser = new parse5.Parser(null, { locationInfo: true })

module.exports = function (content) {
  this.cacheable()
  var cb = this.async()
  var output = {
    template: {},
    style: {},
    script: {},
    includes: []
  }

  var fragment = parser.parseFragment(content)
  fragment.childNodes.forEach(function (node) {
    var src = getAttribute(node, 'src')
    if (src) {
      output.includes.push(src)
      return
    }

    if (!node.childNodes || !node.childNodes.length) {
      return
    }

    var lang = getAttribute(node, 'lang') || ''
    var type = node.tagName
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
    output[type][lang] = content.substring(start, end).trim()
  })

  cb(null, 'module.exports = ' + JSON.stringify(output))
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
