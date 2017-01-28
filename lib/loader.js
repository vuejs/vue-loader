var path = require('path')
var parse = require('./parser')
var genId = require('./gen-id')
var normalize = require('./normalize')
var loaderUtils = require('loader-utils')

// internal lib loaders
var selectorPath = normalize.lib('selector')
var styleRewriterPath = normalize.lib('style-rewriter')
var templateLoaderPath = normalize.lib('template-loader')
var templateCompilerPath = normalize.lib('template-compiler')
var componentNormalizerPath = normalize.lib('component-normalizer')

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

module.exports = function (content) {
  this.cacheable()
  var isServer = this.options.target === 'node'
  var isProduction = this.minimize || process.env.NODE_ENV === 'production'

  var loaderContext = this
  var query = loaderUtils.parseQuery(this.query)
  var options = this.options.__vueOptions__ = Object.assign({}, this.options.vue, this.vue, query)

  var filePath = this.resourcePath
  var fileName = path.basename(filePath)
  var moduleId = 'data-v-' + genId(filePath)
  var styleRewriter = styleRewriterPath + '?id=' + moduleId

  var needCssSourceMap =
    !isProduction &&
    this.sourceMap &&
    options.cssSourceMap !== false

  var bubleOptions = hasBuble && options.buble ? '?' + JSON.stringify(options.buble) : ''
  var defaultLoaders = {
    html: templateCompilerPath + '?id=' + moduleId,
    css: (isServer ? '' : styleLoaderPath + '!') + 'css-loader' + (needCssSourceMap ? '?sourceMap' : ''),
    js: hasBuble ? ('buble-loader' + bubleOptions) : hasBabel ? 'babel-loader' : ''
  }

  // check if there are custom loaders specified via
  // webpack config, otherwise use defaults
  var loaders = Object.assign({}, defaultLoaders, options.loaders)

  function getRequire (type, part, index, scoped) {
    return 'require(' +
      getRequireString(type, part, index, scoped) +
    ')'
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
    ')'
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
    var option = options.cssModules || {}
    var DEFAULT_OPTIONS = {
      modules: true,
      importLoaders: true
    }
    var OPTIONS = {
      localIdentName: '[hash:base64]'
    }
    return loader.replace(/((?:^|!)css(?:-loader)?)(\?[^!]*)?/, function (m, $1, $2) {
      // $1: !css-loader
      // $2: ?a=b
      var query = loaderUtils.parseQuery($2)
      Object.assign(query, OPTIONS, option, DEFAULT_OPTIONS)
      if (index !== -1) {
        // Note:
        //   Class name is generated according to its filename.
        //   Different <style> tags in the same .vue file may generate same names.
        //   Append `_[index]` to class name to avoid this.
        query.localIdentName += '_' + index
      }
      return $1 + '?' + JSON.stringify(query)
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
    var rewriter = type === 'styles' ? styleRewriter + (scoped ? '&scoped=true!' : '!') : ''
    var injectString = (type === 'script' && query.inject) ? 'inject-loader!' : ''
    if (loader !== undefined) {
      if (Array.isArray(loader)) {
        loader = stringifyLoaders(loader)
      }
      // add css modules
      if (type === 'styles') {
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
          return defaultLoaders.html + '!' + templateLoaderPath + '?raw&engine=' + lang + '!'
        case 'styles':
          loader = addCssModulesToLoader(defaultLoaders.css, part, index)
          return loader + '!' + rewriter + ensureBang(ensureLoader(lang))
        case 'script':
          return injectString + ensureBang(ensureLoader(lang))
      }
    }
  }

  // sass => sass-loader
  // sass-loader => sass-loader
  // sass?indentedsyntax!css => sass-loader?indentedSyntax!css-loader
  function ensureLoader (lang) {
    return lang.split('!').map(function (loader) {
      return loader.replace(/^([\w-]+)(\?.*)?/, function (_, name, query) {
        return (/-loader$/.test(name) ? name : (name + '-loader')) + (query || '')
      })
    }).join('!')
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

  var output = ''
  var parts = parse(content, fileName, this.sourceMap)
  var hasScoped = parts.styles.some(function (s) { return s.scoped })

  // css modules
  var cssModules = {}

  // add requires for styles
  if (parts.styles.length) {
    output += '\n/* styles */\n'
    var hasModules = false
    parts.styles.forEach(function (style, i) {
      var moduleName = (style.module === true) ? '$style' : style.module

      // require style
      if (isServer && !moduleName) return
      var requireString = style.src
        ? getRequireForImport('styles', style, style.scoped)
        : getRequire('styles', style, i, style.scoped)

      // setCssModule
      if (moduleName) {
        if (!hasModules) {
          hasModules = true
          output += 'var cssModules = {}\n'
        }
        if (moduleName in cssModules) {
          loaderContext.emitError('CSS module name "' + moduleName + '" is not unique!')
          output += requireString
        } else {
          cssModules[moduleName] = true

          // `style-loader` exposes the name-to-hash map directly
          // `css-loader` exposes it in `.locals`
          // We drop `style-loader` in SSR, and add `.locals` here.
          if (isServer) {
            requireString += '.locals'
          }

          output += 'cssModules["' + moduleName + '"] = ' + requireString + '\n'
        }
      } else {
        output += requireString + '\n'
      }
    })
    output += '\n'
  }

  // we require the component normalizer function, and call it like so:
  // normalizeComponent(
  //   scriptExports,
  //   compiledTemplate,
  //   scopeId,
  //   cssModules
  // )
  output += 'var Component = require(' + JSON.stringify(componentNormalizerPath) + ')(\n'

  // <script>
  output += '  /* script */\n  '
  var script = parts.script
  if (script) {
    output += script.src
      ? getRequireForImport('script', script)
      : getRequire('script', script)
    // inject loader interop
    if (query.inject) {
      output += '(injections)'
    }
  } else {
    output += 'null'
  }
  output += ',\n'

  // <template>
  output += '  /* template */\n  '
  var template = parts.template
  if (template) {
    output += template.src
      ? getRequireForImport('template', template)
      : getRequire('template', template)
  } else {
    output += 'null'
  }
  output += ',\n'

  // scopeId
  output += '  /* scopeId */\n  '
  output += (hasScoped ? JSON.stringify(moduleId) : 'null') + ',\n'

  // cssModules
  output += '  /* cssModules */\n  '
  if (Object.keys(cssModules).length) {
    // inject style modules as computed properties
    output += 'cssModules'
  } else {
    output += 'null'
  }
  output += '\n'

  // close normalizeComponent call
  output += ')\n'

  // development-only code
  if (!isProduction) {
    // add filename in dev
    output += 'Component.options.__file = ' + JSON.stringify(filePath) + '\n'
    // check named exports
    output +=
      'if (Component.esModule && Object.keys(Component.esModule).some(function (key) {' +
        'return key !== "default" && key !== "__esModule"' +
      '})) {' +
        'console.error("named exports are not supported in *.vue files.")' +
      '}\n'
    // check functional components used with templates
    if (template) {
      output +=
        'if (Component.options.functional) {' +
          'console.error("' +
          '[vue-loader] ' + fileName + ': functional components are not ' +
          'supported with templates, they should use render functions.' +
        '")}\n'
    }
  }

  if (!query.inject) {
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
        '    hotAPI.createRecord("' + moduleId + '", Component.options)\n' +
        '  } else {\n' +
        // update
        '    hotAPI.reload("' + moduleId + '", Component.options)\n' +
        '  }\n' +
        '})()}\n'
    }
    // final export
    if (options.esModule) {
      output += '\nexports.__esModule = true;\nexports["default"] = Component.exports\n'
    } else {
      output += '\nmodule.exports = Component.exports\n'
    }
  } else {
    // inject-loader support
    output =
      '\n/* dependency injection */\n' +
      'module.exports = function (injections) {\n' + output + '\n' +
      '\nreturn Component.exports\n}'
  }

  // done
  return output
}
