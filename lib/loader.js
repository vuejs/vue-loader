var loaderUtils = require('loader-utils')
var assign = require('object-assign')
var selectorPath = require.resolve('./selector')
var parserPath = require.resolve('./parser')
var hash = require('hash-sum')
var path = require('path')

var defaultLang = {
  template: 'html',
  style: 'css',
  script: 'js'
}

var defaultLoaders = {
  html: 'vue-html-loader',
  css: 'style-loader!css-loader',
  js: 'babel-loader?presets[]=es2015&plugins[]=transform-runtime'
}

var rewriterInjectRE = /\b((css|(vue-)?html)(-loader)?(\?[^!]+)?!?)\b/
var rewriters = {
  template: require.resolve('./template-rewriter'),
  style: require.resolve('./style-rewriter')
}

module.exports = function (content) {
  var self = this
  this.cacheable()
  var cb = this.async()
  var output = ''
  var options = this.options.vue || {}
  var vueUrl = loaderUtils.getRemainingRequest(this)
  var filePath = this.resourcePath
  var fileName = path.basename(filePath)
  var moduleId = '_v-' + hash(filePath)

  // respect user babel options
  if (this.options.babel) {
    defaultLoaders.js = 'babel'
  }

  // check if there are custom loaders specified with
  // vueLoader.withLoaders(), otherwise use defaults
  var loaders = assign({}, defaultLoaders, options.loaders)

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

  function getRequireForImport (type, impt, scoped) {
    return 'require(' +
      getRequireForImportString(type, impt, scoped) +
    ')\n'
  }

  function getRequireForImportString (type, impt, scoped) {
    return loaderUtils.stringifyRequest(self,
      '-!' +
      getLoaderString(type, impt, scoped) +
      impt.src
    )
  }

  function getLoaderString (type, part, scoped) {
    var lang = part.lang || defaultLang[type]
    var loader = loaders[lang]
    var rewriter = getRewriter(type, scoped)
    if (loader !== undefined) {
      // inject rewriter before css/html loader for
      // extractTextPlugin use cases
      if (rewriterInjectRE.test(loader)) {
        loader = loader.replace(rewriterInjectRE, function (m, $1) {
          return ensureBang($1) + rewriter
        })
      } else {
        loader = ensureBang(loader) + rewriter
      }
      return ensureBang(loader)
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

  function getRewriter (type, scoped) {
    var meta = '?id=' + moduleId + '&file=' + fileName
    switch (type) {
      case 'template':
        return scoped ? (rewriters.template + meta + '!') : ''
      case 'style':
        return rewriters.style + meta + (scoped ? '&scoped=true!' : '!')
      default:
        return ''
    }
  }

  function getSelectorString (type, index) {
    return selectorPath +
      '?type=' + type +
      '&index=' + index + '!'
  }

  function ensureBang (loader) {
    if (loader.charAt(loader.length - 1) !== '!') {
      return loader + '!'
    } else {
      return loader
    }
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
      output += getRequireForImport('style', impt, impt.scoped)
    })

    // add requires for styles
    parts.style.forEach(function (style, i) {
      if (style.scoped) hasLocalStyles = true
      output += getRequire('style', style, i, style.scoped)
    })

    // add require for script
    if (parts.script.length) {
      output +=
        'module.exports = ' + getRequire('script', parts.script[0], 0) + '\n' +
        'if (module.exports.__esModule) module.exports = module.exports.default\n'
    }

    // add require for template
    var template
    if (parts.template.length) {
      template = parts.template[0]
      output += ';(typeof module.exports === "function" ' +
        '? module.exports.options ' +
        ': module.exports).template = ' + (
          template.src
            ? getRequireForImport('template', template, hasLocalStyles)
            : getRequire('template', template, 0, hasLocalStyles)
        )
    }

    // hot reload
    if (
      process.env.NODE_ENV !== 'production' &&
      (parts.script.length || parts.template.length)
    ) {
      output +=
        'if (module.hot) {(function () {' +
        '  module.hot.accept()\n' +
        '  var hotAPI = require("vue-hot-reload-api")\n' +
        '  hotAPI.install(require("vue"), true)\n' +
        '  if (!hotAPI.compatible) return\n' +
        '  var id = ' + JSON.stringify(filePath) + '\n' +
        '  if (!module.hot.data) {\n' +
        // initial insert
        '    hotAPI.createRecord(id, module.exports)\n' +
        '  } else {\n' +
        // update
        '    hotAPI.update(id, module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)\n' +
        '  }\n' +
        '})()}'
    }

    // done
    cb(null, output)
  })
}

module.exports.withLoaders = function () {
  throw new Error(
    'vue.withLoaders has been deprecated in vue-loader 6.0. ' +
    'Add a "vue" section to the webpack config instead.'
  )
}
