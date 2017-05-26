var postcss = require('postcss')
var selectorParser = require('postcss-selector-parser')

module.exports = postcss.plugin('add-id', function (opts) {
  return function (root) {
    root.each(function rewriteSelector (node) {
      if (!node.selector) {
        // handle media queries
        if (node.type === 'atrule' && node.name === 'media') {
          node.each(rewriteSelector)
        }
        return
      }
      node.selector = selectorParser(function (selectors) {
        var sel = opts.scopeUseClass
          ? selectorParser.className({ value: opts.id })
          : selectorParser.attribute({ attribute: opts.id })
        selectors.each(function (selector) {
          if (!opts.deep) {
            var node = null
            selector.each(function (n) {
              if (n.type !== 'pseudo') node = n
            })
            selector.insertAfter(node, sel)
          } else {
            selector.prepend(sel)
          }
        })
      }).process(node.selector).result
    })
  }
})
