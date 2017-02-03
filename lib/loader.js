var path = require('path')
var parse = require('./parser')
var genId = require('./gen-id')
var normalize = require('./normalize')
var loaderUtils = require('loader-utils')
var querystring = require('querystring')

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

// When extracting parts from the source vue file, we want to apply the
// loaders chained before vue-loader, but exclude some loaders that simply
// produces side effects such as linting. This is a hard-coded list and
// hopefully eslint-loader is the only one.
var excludedPreLoadersRE = /eslint-loader/

function getRawRequest (context) {
  return loaderUtils.getRemainingRequest({
    resource: context.resource,
    loaderIndex: context.loaderIndex,
    loaders: context.loaders.filter(loader => !excludedPreLoadersRE.test(loader.path))
  })
}

module.exports = function (content) {
  this.cacheable()
  var isServer = this.options.target === 'node'
  var isProduction = this.minimize || process.env.NODE_ENV === 'production'

  var loaderContext = this
  var query = loaderUtils.parseQuery(this.query)
  var rawRequest = getRawRequest(this)
  var options = this.options.__vueOptions__ = Object.assign({}, this.options.vue, this.vue, query)

  var filePath = this.resourcePath
  var fileName = path.basename(filePath)
  var moduleId = 'data-v-' + genId(filePath, this._compiler.context)
  var styleRewriter = styleRewriterPath + '?id=' + moduleId

  var cssLoaderOptions = ''
  if (!isProduction && this.sourceMap && options.cssSourceMap !== false) {
    cssLoaderOptions += '?sourceMap'
  }
  if (isProduction) {
    cssLoaderOptions += (cssLoaderOptions ? '&' : '?') + 'minimize'
  }

  var bubleOptions = hasBuble && options.buble
    ? '?' + JSON.stringify(options.buble)
    : ''

  var defaultLoaders = {
    html: templateCompilerPath + '?id=' + moduleId,
    css: styleLoaderPath + '!' + 'css-loader' + cssLoaderOptions,
    js: hasBuble ? ('buble-loader' + bubleOptions) : hasBabel ? 'babel-loader' : ''
  }

  // check if there are custom loaders specified via
  // webpack config, otherwise use defaults
  var loaders = Object.assign({}, defaultLoaders, options.loaders)
  var preLoaders = options.preLoaders || {}
  var postLoaders = options.postLoaders || {}

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
      rawRequest
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

  function buildCustomBlockLoaderString (attrs) {
    var noSrcAttrs = Object.assign({}, attrs)
    delete noSrcAttrs.src
    var qs = querystring.stringify(noSrcAttrs)
    return qs ? '?' + qs : qs
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
    var loader = getRawLoaderString(type, part, index, scoped)
    var lang = part.lang || defaultLang[type]
    if (preLoaders[lang]) {
      loader = loader + ensureBang(preLoaders[lang])
    }
    if (postLoaders[lang]) {
      loader = ensureBang(postLoaders[lang]) + loader
    }
    return loader
  }

  function getRawLoaderString (type, part, index, scoped) {
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
      // if user defines custom loaders for html, add template compiler to it
      if (type === 'template' && loader.indexOf(defaultLoaders.html) < 0) {
        loader = defaultLoaders.html + '!' + loader
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
        default:
          loader = loaders[type]
          if (Array.isArray(loader)) {
            loader = stringifyLoaders(loader)
          }
          return ensureBang(loader + buildCustomBlockLoaderString(part.attrs))
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
      '?type=' + ((type === 'script' || type === 'template' || type === 'styles') ? type : 'customBlocks') +
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
  var cssModules

  // add requires for styles
  if (parts.styles.length) {
    output += '\n/* styles */\n'
    var hasModules = false
    parts.styles.forEach(function (style, i) {
      // require style
      var requireString = style.src
        ? getRequireForImport('styles', style, style.scoped)
        : getRequire('styles', style, i, style.scoped)

      var moduleName = (style.module === true) ? '$style' : style.module
      // setCssModule
      if (moduleName) {
        if (!cssModules) {
          cssModules = {}
        }
        if (!hasModules) {
          hasModules = true
          output += 'var cssModules = {}\n'
        }
        if (moduleName in cssModules) {
          loaderContext.emitError('CSS module name "' + moduleName + '" is not unique!')
          output += requireString
        } else {
          cssModules[moduleName] = true

          // `(vue-)style-loader` exposes the name-to-hash map directly
          // `css-loader` exposes it in `.locals`
          // add `.locals` if the user configured to not use style-loader.
          if (requireString.indexOf('style-loader') < 0) {
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
  output += 'var Component = require(' +
    loaderUtils.stringifyRequest(loaderContext, '!' + componentNormalizerPath) +
  ')(\n'

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
  if (cssModules) {
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

  // add requires for customBlocks
  if (parts.customBlocks && parts.customBlocks.length) {
    var addedPrefix = false

    parts.customBlocks.forEach(function (customBlock, i) {
      if (loaders[customBlock.type]) {
        // require customBlock
        customBlock.src = customBlock.attrs.src
        var requireString = customBlock.src
          ? getRequireForImport(customBlock.type, customBlock)
          : getRequire(customBlock.type, customBlock, i)

        if (!addedPrefix) {
          output += '\n/* customBlocks */\n'
          addedPrefix = true
        }

        output += requireString + '\n'
      }
    })

    output += '\n'
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
        '  } else {\n'
      // update
      if (cssModules) {
        output +=
        '    if (module.hot.data.cssModules && JSON.stringify(module.hot.data.cssModules) !== JSON.stringify(cssModules)) {\n' +
        '      delete Component.options._Ctor\n' +
        '    }\n'
      }
      output +=
        '    hotAPI.reload("' + moduleId + '", Component.options)\n' +
        '  }\n'
      if (cssModules) {
        // save cssModules
        output +=
        '  module.hot.dispose(function (data) {\n' +
        '    data.cssModules = cssModules\n' +
        '  })\n'
      }
      output += '})()}\n'
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
