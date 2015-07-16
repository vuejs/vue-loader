var postcss = require('postcss')
var nested = require('postcss-nested')
var hash = require('hash-sum')

var currentClass
var rootRE = /:root\b/g
var processRoot = postcss.plugin('process-root', function () {
  return function (root) {
    root.each(function (node) {
      node.each(function (node) {
        if (rootRE.test(node.selector)) {
          // replace :root selector
          node.selector = node.selector.replace(rootRE, currentClass)
          // move the node to the outer scope to avoid nesting
          node.moveBefore(root.nodes[0])
        }
      })
    })
  }
})

module.exports = function (css) {
  this.cacheable()
  var cb = this.async()
  var cls = currentClass = '.v-' + hash(this.resourcePath)
  css = cls + '{' + css + '}'
  postcss([processRoot, nested])
    .process(css)
    .then(function (result) {
      cb(null, result)
    })
    .catch(cb)
}
