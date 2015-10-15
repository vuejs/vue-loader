var loaderUtils = require('loader-utils')
var selectorPath = require.resolve('./selector')
var parserPath = require.resolve('./parser')

var defaultLang = {
  template: 'html',
  style: 'css',
  script: 'js'
}

var rewriters = {
  template: require.resolve('./template-rewriter') + '!',
  style: require.resolve('./style-rewriter') + '!'
}

module.exports = function (content) {
  var self = this
  this.cacheable()
  var cb = this.async()
  var output = ''
  var vueUrl = loaderUtils.getRemainingRequest(this)

  // check if there are custom loaders specified with
  // vueLoader.withLoaders(), otherwise use defaults
  var loaders = loaderUtils.parseQuery(this.query)
  loaders.html = loaders.html || 'vue-html'
  loaders.css = loaders.css || 'style!css'
  loaders.js = loaders.js || ''

  function getRequire (type, part, index, scoped) {
    return 'require(' +
      getRequireString(type, part, index, scoped) +
    ')\n'
  }

  function getRequireString (type, part, index, scoped) {
    return loaderUtils.stringifyRequest(self,
      // disable system loaders (except post loaders)
      '-!' +
      // get loader string for pre-processors
      getLoaderString(type, part, scoped) +
      // select the corresponding part from the vue file
      getSelectorString(type, index || 0) +
      // the url to the actual vuefile
      vueUrl
    )
  }

  function getRequireForImport (impt) {
    return 'require(' +
      loaderUtils.stringifyRequest(self,
        '-!' +
        getLoaderString('style', impt, impt.scoped) +
        impt.src
      ) +
    ')\n'
  }

  function getLoaderString (type, part, scoped) {
    var lang = part.lang || defaultLang[type]
    var rewriter = scoped ? rewriters[type] || '' : ''
    var loader = loaders[lang]
    if (loader !== undefined) {
      // lang with default or pre-configured loader
      if (loader) loader += '!'
      return loader + rewriter
    } else {
      // unknown lang, assume a loader for it is used
      switch (type) {
      case 'template':
        return 'vue-html!' + rewriter + 'template-html?raw&engine=' + lang + '!'
      case 'style':
        return 'style!css!' + rewriter + lang + '!'
      case 'script':
        return lang + '!'
      }
    }
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
    var hasLocalStyles = false

    // add requires for src imports
    parts.styleImports.forEach(function (impt) {
      if (impt.scoped) hasLocalStyles = true
      output += getRequireForImport(impt)
    })

    // add requires for styles
    parts.style.forEach(function (style, i) {
      if (style.scoped) hasLocalStyles = true
      output += getRequire('style', style, i, style.scoped)
    })

    // only one script tag allowed
    if (parts.script.length) {
      output += 'module.exports = ' +
        getRequire('script', parts.script[0], 0)
    }

    // only one template tag allowed
    if (parts.template.length) {
      output += 'module.exports.template = ' +
        getRequire('template', parts.template[0], 0, hasLocalStyles)
    }

    // hot reload
    if (
      process.env.NODE_ENV !== 'production' &&
      (parts.script.length || parts.template.length)
    ) {
      var scriptString = parts.script.length ? getRequireString('script', parts.script[0], 0) : ''
      var templateString = parts.template.length ? getRequireString('template', parts.template[0], 0, hasLocalStyles) : ''
      var accepted = []
      if (scriptString) {
        accepted.push(scriptString.slice(1, -1))
      }
      if (templateString) {
        accepted.push(templateString.slice(1, -1))
      }
      output +=
        'if (module.hot) {\n' +
          '(function () {\n' +
            // shim the component directive so that it
            // registers the instances
            'var Vue = require("vue")\n' +
            'var shim = require("' + require.resolve('./hot-shim') + '")\n' +
            'shim.install(Vue)\n' +
            'var map = Vue.config._hotComponents\n' +
            'var id = module.exports.hotID = ' + (scriptString || templateString) + '\n' +
            'module.hot.accept(' + JSON.stringify(accepted) + ', function () {\n' +
              'var Ctor = map[id].Ctor\n' + 
              // overwrite existing constructor's options
              (scriptString ? 'Ctor.options = Vue.util.mergeOptions(Vue.options, require(' + scriptString + '))\n' : '') +
              (templateString ? 'Ctor.options.template = require(' + templateString + ')\n' : '') + 
              // reset linker
              'Ctor.linker = null\n' +
              // reload directive instances
              'map[id].instances.forEach(shim.update)\n' +
              // re-enable transitions
            '})\n' +
          '})()\n' +
        '}'
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
  return 'vue?' + JSON.stringify(opts).replace(/!/g, '\\u0021')
}
