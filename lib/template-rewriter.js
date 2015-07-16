var parse5 = require('parse5')
var parser = new parse5.Parser()
var serializer = new parse5.Serializer()
var hash = require('hash-sum')

module.exports = function (html) {
  this.cacheable()
  var cls = 'v-' + hash(this.resourcePath)
  var tree = parser.parseFragment(html)
  tree.childNodes.forEach(function (node) {
    if (node.attrs) {
      var hasClass = false
      for (var i = 0, l = node.attrs.length; i < l; i++) {
        var attr = node.attrs[i]
        if (attr.name === 'class') {
          attr.value += ' ' + cls
          hasClass = true
          break
        }
      }
      if (!hasClass) {
        node.attrs.push({
          name: 'class',
          value: cls
        })
      }
    }
  })
  return serializer.serialize(tree)
}
