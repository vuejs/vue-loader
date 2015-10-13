var postcss = require('postcss')
var selectorParser = require('postcss-selector-parser')
var idGen = require('./id-generator')

var currentId
var addId = postcss.plugin('add-id', function () {
  return function (root) {
    root.each(function (node) {
      node.selector = selectorParser(function (selectors) {
        selectors.each(function (selector) {
          selector.append(selectorParser.attribute({
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
  currentId = idGen.get(this.resourcePath)
  postcss([addId])
    .process(css)
    .then(function (result) {
      cb(null, result)
    })
    .catch(cb)
}
