var loaderUtils = require('loader-utils')
var assign = require('object-assign')
var parse = require('./parser')
var selectorPath = require.resolve('./selector')
var hash = require('hash-sum')
var path = require('path')

var defaultLang = {
  template: 'html',
  style: 'css',
  script: 'js'
}

var rewriterInjectRE = /\b((css|(vue-)?html)(-loader)?(\?[^!]+)?)(?:!|$)/
var rewriters = {
  template: require.resolve('./template-rewriter'),
  style: require.resolve('./style-rewriter')
}

var templateLoader = require.resolve('./template-loader')

module.exports = function (content) {
  var defaultLoaders = {
    html: 'vue-html-loader',
    css: 'vue-style-loader!css-loader',
    js: 'babel-loader?presets[]=es2015&plugins[]=transform-runtime&comments=false'
  }

  this.cacheable()
  var loaderContext = this
  var query = loaderUtils.parseQuery(this.query)
  var options = Object.assign({}, this.options.vue, this.vue, query)
  var filePath = this.resourcePath
  var fileName = path.basename(filePath)
  var moduleId = '_v-' + hash(filePath)

  // respect user babel options
  if (this.options.babel) {
    defaultLoaders.js = 'babel-loader'
  }

  // enable css source map if needed
  if (
    this.sourceMap &&
    !this.minimize &&
    options.cssSourceMap !== false &&
    process.env.NODE_ENV !== 'production'
  ) {
    defaultLoaders.css = 'vue-style-loader!css-loader?sourceMap'
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
      getLoaderString(type, part, index, scoped) +
      // select the corresponding part from the vue file
      getSelectorString(type, index || 0) +
      // the url to the actual vue file, including remaining requests
      loaderUtils.getRemainingRequest(loaderContext)
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
      getLoaderString(type, impt, -1, scoped) +
      impt.src
    )
  }

  function addCssModulesToLoader (loader, part, index) {
    if (!part.module) return loader
    return loader.replace(/((?:^|!)css(?:-loader)?)(\?[^!]*)?/, function (m, $1, $2) {
      // $1: !css-loader
      // $2: ?a=b
      var option = loaderUtils.parseQuery($2)
      option.modules = true
      option.importLoaders = true
      option.localIdentName = '[hash:base64]'
      if (index !== -1) {
        // Note:
        //   Class name is generated according to its filename.
        //   Different <style> tags in the same .vue file may generate same names.
        //   Append `_[index]` to class name to avoid this.
        option.localIdentName += '_' + index
      }
      return $1 + '?' + JSON.stringify(option)
    })
  }

  // stringify an Array of loader objects
  function stringifyLoaders (loaders) {
    return loaders.map(function (obj) {
      return obj && typeof obj === 'object' && typeof obj.loader === 'string'
        ? obj.loader + (obj.options ? '?' + JSON.stringify(obj.options) : '')
        : obj
    }).join('!')
  }

  function getLoaderString (type, part, index, scoped) {
    var lang = part.lang || defaultLang[type]
    var loader = loaders[lang]
    var rewriter = getRewriter(type, scoped)
    var injectString = (type === 'script' && query.inject) ? 'inject!' : ''
    if (loader !== undefined) {
      if (Array.isArray(loader)) {
        loader = stringifyLoaders(loader)
      }

      if (type === 'style') {
        loader = addCssModulesToLoader(loader, part, index)
      }
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
          return defaultLoaders.html + '!' + rewriter + templateLoader + '?raw&engine=' + lang + '!'
        case 'style':
          loader = addCssModulesToLoader(defaultLoaders.css, part, index)
          return loader + '!' + rewriter + lang + '!'
        case 'script':
          return injectString + lang + '!'
      }
    }
  }

  function getRewriter (type, scoped) {
    var meta = '?id=' + moduleId
    switch (type) {
      case 'template':
        return scoped ? (rewriters.template + meta + '!') : ''
      case 'style':
        return rewriters.style + (scoped ? meta + '&scoped=true!' : '!')
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

  var parts = parse(content, fileName, this.sourceMap)
  var hasLocalStyles = false
  var output = 'var __vue_script__, __vue_template__\n' +
               'var __vue_styles__ = {}\n'

  // check if there are any template syntax errors
  var templateWarnings = parts.template.length && parts.template[0].warnings
  if (templateWarnings) {
    templateWarnings.forEach(this.emitError)
  }

  var cssModules = {}
  function setCssModule (style, require) {
    if (!style.module) return require
    if (style.module in cssModules) {
      loaderContext.emitError('CSS module name "' + style.module + '" is not unique!')
      return require
    }
    cssModules[style.module] = true
    return '__vue_styles__["' + style.module + '"] = ' + require + '\n'
  }

  // add requires for src imports
  parts.styleImports.forEach(function (impt) {
    if (impt.scoped) hasLocalStyles = true
    if (impt.module === '') impt.module = '$style'
    var requireString = getRequireForImport('style', impt, impt.scoped, impt.module)
    output += setCssModule(impt, requireString)
  })

  // add requires for styles
  parts.style.forEach(function (style, i) {
    if (style.scoped) hasLocalStyles = true
    if (style.module === '') style.module = '$style'
    var requireString = getRequire('style', style, i, style.scoped, style.module)
    output += setCssModule(style, requireString)
  })

  // add require for script
  var script
  if (parts.script.length) {
    script = parts.script[0]
    output +=
      '__vue_script__ = ' + (
        script.src
          ? getRequireForImport('script', script, 0)
          : getRequire('script', script, 0)
      )
    // check and warn named exports
    if (!this.minimize) {
      output +=
        'if (Object.keys(__vue_script__).some(function (key) { return key !== "default" && key !== "__esModule" })) {\n' +
        '  console.warn(' + JSON.stringify(
            '[vue-loader] ' + path.relative(process.cwd(), filePath) +
            ': named exports in *.vue files are ignored.'
          ) + ')' +
        '}\n'
    }
  }

  // add require for template
  var template
  if (parts.template.length) {
    template = parts.template[0]
    output += '__vue_template__ = ' + (
        template.src
          ? getRequireForImport('template', template, hasLocalStyles)
          : getRequire('template', template, 0, hasLocalStyles)
      )
  }

  if (!query.inject) {
    // attach template
    output +=
      'module.exports = __vue_script__ || {}\n' +
      'if (module.exports.__esModule) module.exports = module.exports.default\n' +
      'var __vue_options__ = typeof module.exports === "function" ' +
        '? (module.exports.options || (module.exports.options = {})) ' +
        ': module.exports\n' +
      'if (__vue_template__) {\n' +
        '__vue_options__.template = __vue_template__\n' +
      '}\n' +
      // inject style modules as computed properties
      'if (!__vue_options__.computed) __vue_options__.computed = {}\n' +
      'Object.keys(__vue_styles__).forEach(function (key) {\n' +
        'var module = __vue_styles__[key]\n' +
        '__vue_options__.computed[key] = function () { return module }\n' +
      '})\n'
    // hot reload
    if (
      !this.minimize &&
      process.env.NODE_ENV !== 'production' &&
      (parts.script.length || parts.template.length)
    ) {
      var hotId = JSON.stringify(moduleId + '/' + fileName)
      output +=
        'if (module.hot) {(function () {' +
        '  module.hot.accept()\n' +
        '  var hotAPI = require("vue-hot-reload-api")\n' +
        '  hotAPI.install(require("vue"), false)\n' +
        '  if (!hotAPI.compatible) return\n' +
        '  var id = ' + hotId + '\n' +
        '  if (!module.hot.data) {\n' +
        // initial insert
        '    hotAPI.createRecord(id, module.exports)\n' +
        '  } else {\n' +
        // update
        '    hotAPI.update(id, module.exports, __vue_template__)\n' +
        '  }\n' +
        '})()}'
    }
  } else {
    output +=
      'module.exports = function (injections) {\n' +
      '  var mod = __vue_script__\n' +
      '    ? __vue_script__(injections)\n' +
      '    : {}\n' +
      '  if (mod.__esModule) mod = mod.default\n' +
      '  if (__vue_template__) { (typeof mod === "function" ? mod.options : mod).template = __vue_template__ }\n' +
      '  return mod\n' +
      '}'
  }

  // done
  return output
}

module.exports.withLoaders = function () {
  throw new Error(
    'vue.withLoaders has been deprecated in vue-loader 6.0. ' +
    'Add a "vue" section to the webpack config instead.'
  )
}
