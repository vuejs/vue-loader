var postcss = require('postcss')
var selectorParser = require('postcss-selector-parser')
var hash = require('hash-sum')
var loaderUtils = require('loader-utils')
var assign = require('object-assign')

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

module.exports = function (css, map) {
  this.cacheable()
  var cb = this.async()

  var query = loaderUtils.parseQuery(this.query)
  var options = this.options.vue || {}
  var autoprefixOptions = options.autoprefixer
  var plugins = options.postcss || []

  // scoped css
  if (query.scoped) {
    plugins.push(addId)
  }

  // autoprefixer
  if (autoprefixOptions !== false) {
    autoprefixOptions = assign(
      {},
      // also respect autoprefixer-loader options
      this.options.autoprefixer,
      autoprefixOptions
    )
    var autoprefixer = require('autoprefixer')(autoprefixOptions)
    plugins.push(autoprefixer)
  }

  // postcss options, for source maps
  var file = loaderUtils.getRemainingRequest(this)
  var opts
  opts = {
    from: file,
    to: file,
    map: {
      inline: false,
      annotation: false
    }
  }
  if (map) {
    opts.map.prev = map
  }

  currentId = '_v-' + hash(this.resourcePath)
  postcss(plugins)
    .process(css, opts)
    .then(function (result) {
      cb(null, result.css, result.map)
    })
    .catch(function (e) {
      console.log(e)
      cb(e)
    })
}
