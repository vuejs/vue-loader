var postcss = require('postcss')
var loaderUtils = require('loader-utils')
var loadPostcssConfig = require('postcss-load-config')
var selectorParser = require('postcss-selector-parser')

var addId = postcss.plugin('add-id', function (opts) {
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
            attribute: opts.id
          }))
        })
      }).process(node.selector).result
    })
  }
})

var trim = postcss.plugin('trim', function (opts) {
  return function (css) {
    css.walk(function (node) {
      if (node.type === 'rule' || node.type === 'atrule') {
        node.raws.before = node.raws.after = '\n'
      }
    })
  }
})

module.exports = function (css, map) {
  this.cacheable()
  var cb = this.async()

  var query = loaderUtils.parseQuery(this.query)
  var vueOptions = this.options.__vueOptions__

  // use the same config loading interface as postcss-loader
  loadPostcssConfig({ webpack: this }).catch(() => {
    // postcss-load-config throws error when no config file is found,
    // but for us it's optional.
  }).then(config => {
    var plugins
    var options

    // inline postcss options for vue-loader
    var rawInlineOptions = vueOptions.postcss
    if (typeof rawInlineOptions === 'function') {
      rawInlineOptions = rawInlineOptions.call(this, this)
    }
    if (Array.isArray(rawInlineOptions)) {
      plugins = rawInlineOptions
    } else if (isObject(rawInlineOptions)) {
      plugins = rawInlineOptions.plugins
      options = rawInlineOptions.options
    }

    plugins = [trim].concat(plugins || [])
    options = Object.assign({
      to: this.resourcePath,
      from: this.resourcePath,
      map: false
    }, options)

    // merge postcss config file
    if (config && config.plugins) {
      plugins = plugins.concat(config.plugins)
    }
    if (config && config.options) {
      options = Object.assign({}, config.options, options)
    }

    // add plugin for vue-loader scoped css rewrite
    if (query.scoped) {
      plugins.push(addId({ id: query.id }))
    }

    // source map
    if (
      this.sourceMap &&
      !this.minimize &&
      vueOptions.cssSourceMap !== false &&
      process.env.NODE_ENV !== 'production' &&
      !options.map
    ) {
      options.map = {
        inline: false,
        annotation: false,
        prev: map
      }
    }

    postcss(plugins)
      .process(css, options)
      .then(function (result) {
        var map = result.map && result.map.toJSON()
        cb(null, result.css, map)
        return null // silence bluebird warning
      })
      .catch(function (e) {
        console.log(e)
        cb(e)
      })
  })
}

function isObject (val) {
  return val && typeof val === 'object'
}
