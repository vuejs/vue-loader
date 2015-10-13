var parse5 = require('parse5')
var parser = new parse5.Parser()
var serializer = new parse5.Serializer()
var idGen = require('./id-generator')

module.exports = function (html) {
  this.cacheable()
  var id = idGen.get(this.resourcePath)
  var tree = parser.parseFragment(html)
  walk(tree, function (node) {
    if (node.attrs) {
      node.attrs.push({
        name: id,
        value: ''
      })
    }
  })
  return serializer.serialize(tree)
}

function walk (tree, fn) {
  if (tree.childNodes) {
    tree.childNodes.forEach(function (node) {
      fn(node)
      walk(node, fn)
    })
  }
}
