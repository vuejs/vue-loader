var loaderUtils = require('loader-utils')
var selectorPath = require.resolve('./selector')
var parserPath = require.resolve('./parser')

// load babelrc
var babelrc
var fs = require('fs')
var babelrcPath = process.cwd() + '/.babelrc'
if (fs.existsSync(babelrcPath)) {
  babelrc = JSON.stringify(JSON.parse(fs.readFileSync(babelrcPath, 'utf-8')))
}

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
      // make sure babelrc is respected
      if (loader === 'babel') {
        loader += '?' + babelrc
      }
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
      var hotReloadAPIPath = require.resolve('vue-hot-reload-api').replace(/\\/g, '\\\\')
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
            'var hotAPI = require("' + hotReloadAPIPath + '")\n' +
            'hotAPI.install(require("vue"))\n' +
            'if (!hotAPI.compatible) return\n' +
            'var id = module.exports.hotID = ' + (scriptString || templateString) + '\n' +
            // create the record
            'hotAPI.createRecord(id, module.exports)\n' +
            'module.hot.accept(' + JSON.stringify(accepted) + ', function () {\n' +
              'var newOptions = ' + (scriptString ? 'require(' + scriptString + ')\n' : 'null\n') +
              'var newTemplate = ' + (templateString ? 'require(' + templateString + ')\n' : 'null\n') +
              'hotAPI.update(id, newOptions, newTemplate)\n' +
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
