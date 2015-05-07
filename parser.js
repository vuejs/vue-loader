var parse5 = require('parse5')
var parser = new parse5.Parser()
var serializer = new parse5.TreeSerializer()

module.exports = function (content) {
  this.cacheable()
  var cb = this.async()

  // only 1 template tag is allowed, while styles and
  // scripts are concatenated.
  var languages = {}
  var output = {
    template: {},
    style: {},
    script: {},
    includes: []
  }

  // parse the file into an HTML tree
  var fragment = parser.parseFragment(content)

  // Walk through the top level nodes and check for their
  // types & languages. If there are pre-processing needed,
  // push it into a jobs list.
  fragment.childNodes.forEach(function (node) {
    var type = node.nodeName;
    if (type == '#text')
      return
    if (checkSrc(node, output.includes))
      return

    var lang = checkLang(node) || ''
    output[type][lang] = (output[type][lang] || '') + serialize(node) + '\n'
  })

  cb(null, 'module.exports = ' + JSON.stringify(output))
}

function checkLang (node) {
  if (node.attrs) {
    var i = node.attrs.length
    while (i--) {
      var attr = node.attrs[i]
      if (attr.name === 'lang') {
        return attr.value
      }
    }
  }
}

function checkSrc (node, arr) {
  if (node.attrs) {
    var i = node.attrs.length
    while (i--) {
      var attr = node.attrs[i]
      if (attr.name === 'src') {
        arr.push(attr.value)
        return true
      }
    }
  }
  return false
}

// Work around changes in parse5 >= 1.2.0
function serialize (node) {
  var childNode = node.childNodes[0]
  if (childNode && childNode.nodeName === '#document-fragment') {
    return serializer.serialize(childNode)
  }
  return serializer.serialize(node)
}
