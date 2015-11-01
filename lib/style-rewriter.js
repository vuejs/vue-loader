var postcss = require('postcss')
var selectorParser = require('postcss-selector-parser')
var hash = require('hash-sum')
var loaderUtils = require('loader-utils')

var currentId
var addId = postcss.plugin('add-id', function () {
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
        selectors.each(function (selector) {
          var node = null
          selector.each(function (n) {
            if (n.type !== 'pseudo') node = n
          })
          selector.insertAfter(node, selectorParser.attribute({
            attribute: currentId
          }))
        })
      }).process(node.selector).result
    })
  }
})

module.exports = function (css) {
  this.cacheable()
  var cb = this.async()

  var query = loaderUtils.parseQuery(this.query)
  var options = this.options.vue || {}
  var autoprefixOptions = options.autoprefixer

  var processors = []
  if (query.scoped) {
    processors.push(addId)
  }
  if (autoprefixOptions !== false) {
    autoprefixOptions = autoprefixOptions || { remove: false }
    var autoprefixer = require('autoprefixer')(autoprefixOptions)
    processors.push(autoprefixer)
  }

  currentId = '_v-' + hash(this.resourcePath)
  postcss(processors)
    .process(css)
    .then(function (result) {
      cb(null, result)
    })
    .catch(function (e) {
      console.log(e)
      cb(e)
    })
}
