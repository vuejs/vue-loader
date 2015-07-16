var loaderUtils = require('loader-utils')
var selectorPath = require.resolve('./selector')
var parserPath = require.resolve('./parser')
var cssRewriterPath = require.resolve('./css-rewriter')

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

  function getRequire (type, part, index) {
    return 'require(' +
      loaderUtils.stringifyRequest(self,
        // disable system loaders (except post loaders)
        '-!' +
        // get loader string for pre-processors
        getLoaderString(type, part) +
        // select the corresponding part from the vue file
        getSelectorString(type, index || 0) +
        // the url to the actual vuefile
        vueUrl
      ) +
    ')\n'
  }

  function getRequireForImport (include) {
    return 'require(' +
      loaderUtils.stringifyRequest(self,
        '-!' +
        getLoaderString(include.type, include) +
        include.src
      ) +
    ')\n'
  }

  function getLoaderString (type, part) {
    var lang = part.lang || defaultLang[type]
    var localCssString = type === 'style' && part.local
      ? cssRewriterPath + '!'
      : ''
    return loaders[lang] !== undefined
      ? loaders[lang] + '!' + localCssString
      : loaderPrefix[type] + localCssString + lang + '!'
  }

  function getSelectorString (type, index) {
    return selectorPath +
      '?type=' + type +
      '&index=' + index + '!'
  }

  var url = '!!' + parserPath + '!' + vueUrl
  this.loadModule(url, function (err, source) {
    if (err) return cb(err)

    // up to this part, what we have done is basically executing
    // parser.js on the raw vue file and get the parsing result
    // which is an object that contains info about the vue file.
    var parts = self.exec(source, url)

    // add requires for src imports
    parts.includes.forEach(function (include) {
      output += getRequireForImport(include)
    })

    // add requires for styles
    parts.style.forEach(function (style, i) {
      output += getRequire('style', style, i)
    })

    // only one script tag allowed
    if (parts.script.length) {
      output += 'module.exports = ' +
        getRequire('script', parts.script[0])
    }

    // only one template tag allowed
    if (parts.template.length) {
      output += 'module.exports.template = ' +
        getRequire('template', parts.template[0])
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
