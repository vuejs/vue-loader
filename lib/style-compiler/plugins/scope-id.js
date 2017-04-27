var postcss = require('postcss')
var selectorParser = require('postcss-selector-parser')

module.exports = postcss.plugin('add-id', function (opts) {
  return function (root) {
    var keyframes = Object.create(null)

    root.each(function rewriteSelector (node) {
      if (!node.selector) {
        // handle media queries
        if (node.type === 'atrule') {
          if (node.name === 'media') {
            node.each(rewriteSelector)
          } else if (node.name === 'keyframes') {
            // register keyframes
            keyframes[node.params] = node.params = node.params + '-' + opts.id
          }
        }
        return
      }
      node.selector = selectorParser(function (selectors) {
        selectors.each(function (selector) {
          var node = null
          selector.each(function (n) {
            if (n.type !== 'pseudo') node = n
          })
          selector.insertAfter(node, selectorParser.attribute({
            attribute: opts.id
          }))
        })
      }).process(node.selector).result
    })

    if (Object.keys(keyframes).length) {
      root.walkDecls(decl => {
        if (/-?animation$/.test(decl.prop) && keyframes[decl.value]) {
          decl.value = keyframes[decl.value]
        }
      })
    }
  }
})
