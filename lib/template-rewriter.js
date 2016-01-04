var parse5 = require('parse5')
var loaderUtils = require('loader-utils')

module.exports = function (html) {
  this.cacheable()
  var query = loaderUtils.parseQuery(this.query)
  var id = query.id
  var tree = parse5.parseFragment(html)
  walk(tree, function (node) {
    if (node.attrs) {
      node.attrs.push({
        name: id,
        value: ''
      })
    }
  })
  return parse5.serialize(tree)
}

function walk (tree, fn) {
  if (tree.childNodes) {
    tree.childNodes.forEach(function (node) {
      fn(node)
      walk(node, fn)
    })
  }
}
