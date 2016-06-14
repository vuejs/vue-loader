var loaderUtils = require('loader-utils')
var assign = require('object-assign')
var parse = require('./parser')
var hash = require('hash-sum')
var path = require('path')
var normalize = require('./normalize')

// internal lib loaders
var selectorPath = normalize.lib('selector')
var templateLoaderPath = normalize.lib('template-loader')
var templateCompilerPath = normalize.lib('template-compiler')
var styleRewriterPath = normalize.lib('style-rewriter')

// dep loaders
var styleLoaderPath = normalize.dep('vue-style-loader')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')

var hasBabel = true
try {
  require('babel-loader')
} catch (e) {
  hasBabel = false
}

var rewriterInjectRE = /\b(css(?:-loader)?(?:\?[^!]+)?)(?:!|$)/

var defaultLang = {
  template: 'html',
  styles: 'css',
  script: 'js'
}

module.exports = function (content) {
  this.cacheable()
  var loaderContext = this
  var options = this.options.vue || {}
  var query = loaderUtils.parseQuery(this.query)
  var filePath = this.resourcePath
  var fileName = path.basename(filePath)
  var moduleId = '_v-' + hash(filePath)
  var styleRewriter = styleRewriterPath + '?id=' + moduleId

  var needCssSourceMap =
    this.sourceMap &&
    !this.minimize &&
    process.env.NODE_ENV !== 'production' &&
    options.cssSourceMap !== false

  var defaultLoaders = {
    html: templateCompilerPath + '?id=' + moduleId,
    css: styleLoaderPath + '!css-loader' + (needCssSourceMap ? '?sourceMap' : ''),
    js: hasBabel
      ? this.options.babel
        ? 'babel-loader' // respect user options
        : 'babel-loader?presets[]=es2015&plugins[]=transform-runtime&comments=false'
      : ''
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
  var hasScoped = false
  var output = 'var __vue_script__\n'

  // add requires for styles
  parts.styles.forEach(function (style, i) {
    var scoped = style.scoped
    if (scoped) hasScoped = true
    output += style.src
      ? getRequireForImport('styles', style, scoped)
      : getRequire('styles', style, i, scoped)
  })

  // add require for script
  var script = parts.script
  if (script) {
    output +=
      '__vue_script__ = ' + (
        script.src
          ? getRequireForImport('script', script)
          : getRequire('script', script)
      )
    // check and warn named exports
    if (!this.minimize) {
      output +=
        'if (__vue_script__ &&\n' +
        '    __vue_script__.__esModule &&\n' +
        '    Object.keys(__vue_script__).length > 1) {\n' +
        '  console.warn(' + JSON.stringify(
            '[vue-loader] ' + path.relative(process.cwd(), filePath) +
            ': named exports in *.vue files are ignored.'
          ) + ')' +
        '}\n'
    }
  }

  // plain require() compatibility
  var exports = 'if (__exports__.__esModule) __exports__ = __exports__.default\n'

  // add require for template
  var template = parts.template
  if (template) {
    output += 'var __vue_template__ = ' + (
      template.src
        ? getRequireForImport('template', template)
        : getRequire('template', template)
    )
    // attach render functions to exported options
    exports +=
      'var __vue_options__ = (typeof __exports__ === "function" ' +
        '? (__exports__.options || (__exports__.options = {})) ' +
        ': __exports__)\n' +
      '__vue_options__.render = __vue_template__.render\n' +
      '__vue_options__.staticRenderFns = __vue_template__.staticRenderFns\n'
    // attach scoped id
    if (hasScoped) {
      exports += '__vue_options__._scopeId = "' + moduleId + '"\n'
    }
  }

  if (!query.inject) {
    output +=
      'var __exports__ = __vue_script__ || {}\n' +
      exports +
      'module.exports = __exports__'
    // hot reload
    if (
      !this.minimize &&
      process.env.NODE_ENV !== 'production' &&
      (parts.script || parts.template)
    ) {
      output +=
        '\nif (module.hot) {(function () {' +
        '  var hotAPI = require("' + hotReloadAPIPath + '")\n' +
        '  hotAPI.install(require("vue"), false)\n' +
        '  if (!hotAPI.compatible) return\n' +
        '  module.hot.accept()\n' +
        '  if (!module.hot.data) {\n' +
        // initial insert
        '    hotAPI.createRecord("' + moduleId + '", __exports__)\n' +
        '  } else {\n' +
        // update
        '    hotAPI.reload("' + moduleId + '", __exports__)\n' +
        '  }\n' +
        '})()}'
    }
  } else {
    output +=
      'module.exports = function (injections) {\n' +
      '  var __exports__ = __vue_script__\n' +
      '    ? __vue_script__(injections)\n' +
      '    : {}\n' + exports +
      '  return __exports__\n' +
      '}'
  }

  // done
  return output
}
