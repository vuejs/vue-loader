var postcss = require('postcss')
var nested = require('postcss-nested')
var hash = require('hash-sum')

var currentClass
var rootRE = /:root\b/g
var liftRE = /^(html|head|body)\b/
var processRoot = postcss.plugin('process-root', function () {
  return function (root) {
    var lifted = 0
    function lift (node) {
      node.moveBefore(root.nodes[lifted++])
    }
    root.each(function (node) {
      node.each(function (node) {
        var sel = node.selector
        if (liftRE.test(sel)) {
          lift(node)
        } else if (rootRE.test(sel)) {
          // replace :root selector
          node.selector = sel.replace(rootRE, currentClass)
          lift(node)
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
