var parse5 = require('parse5')

module.exports = function (html, modules) {
  var tree = parse5.parseFragment(html)
  walk(tree, function (node) {
    if (!node.attrs) return
    node.attrs.forEach(function (attr) {
      if (attr.name !== 'class') return
      var arr = attr.value.split('.')
      var module = arr[0]
      var className = arr[1]
      if (!className) return
      var map = modules[module]
      if (!map) return console.error('xxx')
      if (!map[className]) return console.error('yyy')
      attr.value = map[className]
    })
  })
  return parse5.serialize(tree)
}

function walk (tree, fn) {
  if (tree.childNodes) {
    tree.childNodes.forEach(function (node) {
      var isTemplate = node.tagName === 'template'
      if (!isTemplate) {
        fn(node)
      }
      if (isTemplate && node.content) {
        walk(node.content, fn)
      } else {
        walk(node, fn)
      }
    })
  }
}
