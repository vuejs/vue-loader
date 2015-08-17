var postcss = require('postcss')
var nested = require('postcss-nested')
var selectorParser = require('postcss-selector-parser')
var hash = require('hash-sum')

var liftRE = /^(html|head|body)\b/
var scopeRE = /:scope\b/
var processRoot = postcss.plugin('process-root', function () {
  return function (root) {
    var lifted = 0
    function lift (node) {
      node.moveBefore(root.nodes[lifted++])
    }
    root.each(function (node) {
      node.each(function (node) {
        var kept = []
        selectorParser(function (selectors) {
          selectors.each(function (selector) {
            var sel = selector.toString()
            if (liftRE.test(sel)) {
              lift(node.clone({
                selector: sel
              }))
            } else {
              kept.push(sel)
            }
          })
        }).process(node.selector)
        if (!kept.length) {
          node.removeSelf()
        } else {
          node.selector = kept.join(',').replace(scopeRE, '&')
        }
      })
    })
  }
})

module.exports = function (css) {
  this.cacheable()
  var cb = this.async()
  var cls = '.v-' + hash(this.resourcePath)
  css = cls + '{' + css + '}'
  postcss([processRoot, nested])
    .process(css)
    .then(function (result) {
      cb(null, result)
    })
    .catch(cb)
}
