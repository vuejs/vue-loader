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
            // "deep" combinator
            if (n.type === 'combinator' && n.value === '>>>') {
              n.value = ' '
              n.spaces.before = n.spaces.after = ''
              return false
            }
            if (n.type !== 'pseudo') node = n
          })
          selector.insertAfter(node, selectorParser.attribute({
            attribute: opts.id
          }))
        })
      }).process(node.selector).result
    })

    // If keyframes are found in this <style>, find and rewrite animation names
    // in declarations.
    // Caveat: this only works for keyframes and animation rules in the same
    // <style> element.
    if (Object.keys(keyframes).length) {
      root.walkDecls(decl => {
        // individual animation-name declaration
        if (/-?animation-name$/.test(decl.prop)) {
          decl.value = decl.value.split(',')
            .map(v => keyframes[v.trim()] || v.trim())
            .join(',')
        }
        // shorthand
        if (/-?animation$/.test(decl.prop)) {
          decl.value = decl.value.split(',')
            .map(v => {
              var vals = v.split(/\s+/)
              var name = vals[0]
              if (keyframes[name]) {
                return [keyframes[name]].concat(vals.slice(1)).join(' ')
              } else {
                return v
              }
            })
            .join(',')
        }
      })
    }
  }
})
