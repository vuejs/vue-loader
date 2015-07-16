var loaderUtils = require('loader-utils')

module.exports = function (content) {
  var self = this
  this.cacheable()
  var cb = this.async()
  var output = ''
  var vueUrl = loaderUtils.getRemainingRequest(this)

  // check if there are custom loaders specified with
  // vueLoader.withLoaders(), otherwise use defaults
  var loaders = loaderUtils.parseQuery(this.query)
  loaders.html = loaders.html || 'html'
  loaders.css = loaders.css || 'style!css'
  loaders.js = loaders.js || ''

  var loaderPrefix = {
    template: 'html!template-html-loader?raw&engine=',
    style: 'style!css!',
    script: ''
  }

  var defaultLang = {
    template: 'html',
    style: 'css',
    script: 'js'
  }

  /**
   * Determine the loaders to use for an extracted part.
   *
   * @param {String} part - style|script|template
   * @param {String} lang
   * @return {String}
   */
  function loader (part, lang) {
    lang = lang || defaultLang[part]
    var loader = loaders[lang] !== undefined
      ? loaders[lang]
      : loaderPrefix[part] + lang
    return loader ? loader + '!' : ''
  }

  /**
   * Generate a require call for an extracted part.
   *
   * @param {String} part - style|script|template
   * @param {String} lang
   * @return {String}
   */
  function getRequire (part, lang) {
    return 'require(' +
      loaderUtils.stringifyRequest(self,
        '-!' + loader(part, lang) +
        require.resolve('./selector.js') + '?' + part + '/' + lang + '!' +
        vueUrl
      ) +
    ')'
  }

  var url = '!!' + require.resolve('./parser.js') + '!' + vueUrl
  this.loadModule(url, function (err, source) {
    if (err) return cb(err)

    // up to this part, what we have done is basically executing
    // parser.js on the raw vue file and get the parsing result
    // which is an object that contains info about the vue file.
    var parts = self.exec(source, url)
    var lang

    // add require for all the src imports
    for (var i = 0; i < parts.includes.length; i++) {
      var importReqeust = loaderUtils.urlToRequest(parts.includes[i])
      output += 'require(' + loaderUtils.stringifyRequest(this, importReqeust) + ')\n'
    }

    // add require for styles
    for (lang in parts.style) {
      output += getRequire('style', lang) + '\n'
    }

    // add require for script
    for (lang in parts.script) {
      output += 'module.exports = ' + getRequire('script', lang) + '\n'
    }

    // add require for template
    var hasTemplate = false
    for (lang in parts.template) {
      if (hasTemplate) {
        return cb(new Error('Only one template element allowed per vue component!'))
      }
      output += 'module.exports.template = ' + getRequire('template', lang)
      hasTemplate = true
    }

    // done
    cb(null, output)
  })
}

/**
 * Expose a way to specify custom loaders to be used at the
 * end for the extracted parts of a component.
 */
module.exports.withLoaders = function (opts) {
  return 'vue-loader?' + JSON.stringify(opts).replace(/!/g, '\\u0021')
}
