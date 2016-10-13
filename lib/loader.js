var loaderUtils = require('loader-utils')
var assign = require('object-assign')
var parse = require('./parser')
var path = require('path')
var normalize = require('./normalize')
var genId = require('./gen-id')

// internal lib loaders
var selectorPath = normalize.lib('selector')
var templateLoaderPath = normalize.lib('template-loader')
var templateCompilerPath = normalize.lib('template-compiler')
var styleRewriterPath = normalize.lib('style-rewriter')

// dep loaders
var styleLoaderPath = normalize.dep('vue-style-loader')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')

var hasBabel = false
try {
  hasBabel = !!require('babel-loader')
} catch (e) {}

var hasBuble = false
try {
  hasBuble = !!require('buble-loader')
} catch (e) {}

var rewriterInjectRE = /\b(css(?:-loader)?(?:\?[^!]+)?)(?:!|$)/

var defaultLang = {
  template: 'html',
  styles: 'css',
  script: 'js'
}

var checkNamedExports =
  'if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {' +
  'console.error("named exports are not supported in *.vue files.")}\n'

module.exports = function (content) {
  this.cacheable()
  var isServer = this.options.target === 'node'
  var loaderContext = this
  var query = loaderUtils.parseQuery(this.query)
  var options = this.options.__vueOptions__ = Object.assign({}, this.options.vue, this.vue, query)
  var filePath = this.resourcePath
  var fileName = path.basename(filePath)
  var moduleId = 'data-v-' + genId(filePath)
  var styleRewriter = styleRewriterPath + '?id=' + moduleId

  var isProduction = this.minimize || process.env.NODE_ENV === 'production'

  var needCssSourceMap =
    !isProduction &&
    this.sourceMap &&
    options.cssSourceMap !== false

  var bubleOptions = hasBuble && options.buble ? '?' + JSON.stringify(options.buble) : ''
  var defaultLoaders = {
    html: templateCompilerPath + '?id=' + moduleId,
    css: styleLoaderPath + '!css-loader' + (needCssSourceMap ? '?sourceMap' : ''),
    js: hasBuble ? ('buble-loader' + bubleOptions) : hasBabel ? 'babel-loader' : ''
  }

  // check if there are custom loaders specified via
  // webpack config, otherwise use defaults
  var loaders = assign({}, defaultLoaders, options.loaders)

  function getRequire (type, part, index, scoped) {
    return 'require(' +
      getRequireString(type, part, index, scoped) +
    ')\n'
  }

  function getRequireString (type, part, index, scoped) {
    return loaderUtils.stringifyRequest(loaderContext,
      // disable all configuration loaders
      '!!' +
      // get loader string for pre-processors
      getLoaderString(type, part, scoped) +
      // select the corresponding part from the vue file
      getSelectorString(type, index || 0) +
      // the url to the actual vuefile
      filePath
    )
  }

  function getRequireForImport (type, impt, scoped) {
    return 'require(' +
      getRequireForImportString(type, impt, scoped) +
    ')\n'
  }

  function getRequireForImportString (type, impt, scoped) {
    return loaderUtils.stringifyRequest(loaderContext,
      '!!' +
      getLoaderString(type, impt, scoped) +
      impt.src
    )
  }

  function getLoaderString (type, part, scoped) {
    var lang = part.lang || defaultLang[type]
    var loader = loaders[lang]
    var rewriter = type === 'styles' ? styleRewriter + (scoped ? '&scoped=true!' : '!') : ''
    var injectString = (type === 'script' && query.inject) ? 'inject!' : ''
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
      return injectString + ensureBang(loader)
    } else {
      // unknown lang, infer the loader to be used
      switch (type) {
        case 'template':
          return defaultLoaders.html + '!' + templateLoaderPath + '?raw&engine=' + lang + '!'
        case 'styles':
          return defaultLoaders.css + '!' + rewriter + lang + '!'
        case 'script':
          return injectString + lang + '!'
      }
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

  var parts = parse(content, fileName, this.sourceMap)
  var hasScoped = parts.styles.some(function (s) { return s.scoped })
  var output = 'var __vue_exports__, __vue_options__\n'

  // add requires for styles
  if (!isServer && parts.styles.length) {
    output += '\n/* styles */\n'
    parts.styles.forEach(function (style, i) {
      output += style.src
        ? getRequireForImport('styles', style, style.scoped)
        : getRequire('styles', style, i, style.scoped)
    })
  }

  // add require for script
  var script = parts.script
  if (script) {
    output += '\n/* script */\n'
    output +=
      '__vue_exports__ = ' + (
        script.src
          ? getRequireForImport('script', script)
          : getRequire('script', script)
      )
  }

  var exports =
    '__vue_options__ = __vue_exports__ = __vue_exports__ || {}\n' +
    // ES6 modules interop
    'if (\n' +
    '  typeof __vue_exports__.default === "object" ||\n' +
    '  typeof __vue_exports__.default === "function"\n' +
    ') {\n' +
      (isProduction ? '' : checkNamedExports) +
      '__vue_options__ = __vue_exports__ = __vue_exports__.default\n' +
    '}\n' +
    // constructor export interop
    'if (typeof __vue_options__ === "function") {\n' +
    '  __vue_options__ = __vue_options__.options\n' +
    '}\n' +
    // add filename in dev
    (isProduction ? '' : ('__vue_options__.__file = ' + JSON.stringify(filePath))) + '\n'

  // add require for template
  var template = parts.template
  if (template) {
    output += '\n/* template */\n'
    output += 'var __vue_template__ = ' + (
      template.src
        ? getRequireForImport('template', template)
        : getRequire('template', template)
    )
    // attach render functions to exported options
    exports +=
      '__vue_options__.render = __vue_template__.render\n' +
      '__vue_options__.staticRenderFns = __vue_template__.staticRenderFns\n'
  }

  // attach scoped id
  if (hasScoped) {
    exports += '__vue_options__._scopeId = "' + moduleId + '"\n'
  }

  if (!query.inject) {
    output += exports
    // hot reload
    if (
      !isServer &&
      !isProduction &&
      (parts.script || parts.template)
    ) {
      output +=
        '\n/* hot reload */\n' +
        'if (module.hot) {(function () {\n' +
        '  var hotAPI = require("' + hotReloadAPIPath + '")\n' +
        '  hotAPI.install(require("vue"), false)\n' +
        '  if (!hotAPI.compatible) return\n' +
        '  module.hot.accept()\n' +
        '  if (!module.hot.data) {\n' +
        // initial insert
        '    hotAPI.createRecord("' + moduleId + '", __vue_options__)\n' +
        '  } else {\n' +
        // update
        '    hotAPI.reload("' + moduleId + '", __vue_options__)\n' +
        '  }\n' +
        '})()}\n'
    }
    // check functional
    if (!isProduction) {
      output +=
        'if (__vue_options__.functional) {console.error("' +
          '[vue-loader] ' + fileName + ': functional components are not ' +
          'supported and should be defined in plain js files using render ' +
          'functions.' +
        '")}\n'
    }
    // final export
    if (options.esModule) {
      output += '\nexports.__esModule = true;\nexports["default"] = __vue_exports__\n'
    } else {
      output += '\nmodule.exports = __vue_exports__\n'
    }
  } else {
    // inject-loader support
    output +=
      '\n/* dependency injection */\n' +
      'module.exports = function (injections) {\n' +
      '  __vue_exports__ = __vue_exports__(injections)\n' +
      exports +
      '  return __vue_exports__\n' +
      '}'
  }

  // done
  return output
}
