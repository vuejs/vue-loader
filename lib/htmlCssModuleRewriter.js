var parse5 = require('parse5')

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

module.exports = function (html, modules) {
  function convert (className) {
    className = className.trim()
    if (!className) return ''
    var arr = className.split('.')
    var module = arr[0]
    className = arr[1]
    if (!className) return ''
    var map = modules[module]
    if (!map) return 'xxx'
    if (!map[className]) return 'yyy'
    return map[className]
  }

  var tree = parse5.parseFragment(html)
  walk(tree, function (node) {
    if (!node.attrs) return
    node.attrs.forEach(function (attr) {
      var expression = ''
      if (attr.name === 'class') {
        var match = attr.value.match(/^\s*({{.+}})\s*$/)
        if (!match) {
          attr.value = convert(attr.value)
          return
        }
        expression = match[1]
      } else {
        if (attr.name === 'v-bind:class' || attr.name === ':class') {
          expression = attr.value
        }
      }
      if (!expression) return
      attr.value = expression.replace(/'(.+?)'/g, function (match, className) {
        return "'" + convert(className) + "'"
      })
    })
  })
  return parse5.serialize(tree)
}
