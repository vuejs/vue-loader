var path = require('path')
var hash = require('hash-sum')
var parse = require('./parser')
var genId = require('./utils/gen-id')
var querystring = require('querystring')
var loaderUtils = require('loader-utils')
var normalize = require('./utils/normalize')
var tryRequire = require('./utils/try-require')

// internal lib loaders
var selectorPath = normalize.lib('selector')
var styleCompilerPath = normalize.lib('style-compiler/index')
var templateCompilerPath = normalize.lib('template-compiler/index')
var templatePreprocessorPath = normalize.lib('template-compiler/preprocessor')
var componentNormalizerPath = normalize.lib('component-normalizer')

// dep loaders
var styleLoaderPath = normalize.dep('vue-style-loader')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')

// check whether default js loader exists
var hasBabel = !!tryRequire('babel-loader')
var hasBuble = !!tryRequire('buble-loader')

var rewriterInjectRE = /\b(css(?:-loader)?(?:\?[^!]+)?)(?:!|$)/

var defaultLang = {
  template: 'html',
  styles: 'css',
  script: 'js'
}

// When extracting parts from the source vue file, we want to apply the
// loaders chained before vue-loader, but exclude some loaders that simply
// produces side effects such as linting.
function getRawRequest (context, excludedPreLoaders) {
  excludedPreLoaders = excludedPreLoaders || /eslint-loader/
  return loaderUtils.getRemainingRequest({
    resource: context.resource,
    loaderIndex: context.loaderIndex,
    loaders: context.loaders.filter(loader => !excludedPreLoaders.test(loader.path))
  })
}

module.exports = function (content) {
  this.cacheable()
  var isServer = this.target === 'node'
  var isProduction = this.minimize || process.env.NODE_ENV === 'production'

  var loaderContext = this
  var query = loaderUtils.getOptions(this) || {}
  var options = Object.assign({
    esModule: true
  }, this.options.vue, this.vue, query)

  // disable esModule in inject mode
  // because import/export must be top-level
  if (query.inject) {
    options.esModule = false
  }

  // #824 avoid multiple webpack runs complaining about unknown option
  Object.defineProperty(this.options, '__vueOptions__', {
    value: options,
    enumerable: false,
    configurable: true
  })

  var rawRequest = getRawRequest(this, options.excludedPreLoaders)
  var filePath = this.resourcePath
  var fileName = path.basename(filePath)

  var context = (this._compiler && this._compiler.context) || this.options.context || process.cwd()
  var moduleId = 'data-v-' + genId(filePath, context, options.hashKey)
  var shortFilePath = path.relative(context, filePath).replace(/^(\.\.\/)+/, '')

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

  var output = ''
  var parts = parse(content, fileName, this.sourceMap)
  var hasScoped = parts.styles.some(function (s) { return s.scoped })
  var hasComment = parts.template && parts.template.attrs && parts.template.attrs.comments

  var templateCompilerOptions = '?' + JSON.stringify({
    id: moduleId,
    hasScoped: hasScoped,
    hasComment: hasComment,
    transformToRequire: options.transformToRequire,
    preserveWhitespace: options.preserveWhitespace,
    buble: options.buble,
    // only pass compilerModules if it's a path string
    compilerModules: typeof options.compilerModules === 'string'
      ? options.compilerModules
      : undefined
  })

  var defaultLoaders = {
    html: templateCompilerPath + templateCompilerOptions,
    css: options.extractCSS
      ? getCSSExtractLoader()
      : styleLoaderPath + '!' + 'css-loader' + cssLoaderOptions,
    js: hasBuble ? ('buble-loader' + bubleOptions) : hasBabel ? 'babel-loader' : ''
  }

  // check if there are custom loaders specified via
  // webpack config, otherwise use defaults
  var loaders = Object.assign({}, defaultLoaders, options.loaders)
  var preLoaders = options.preLoaders || {}
  var postLoaders = options.postLoaders || {}

  var needsHotReload = (
    !isServer &&
    !isProduction &&
    (parts.script || parts.template)
  )

  if (needsHotReload) {
    output += 'var disposed = false\n'
  }

  // add requires for styles
  var cssModules
  if (parts.styles.length) {
    var styleInjectionCode = 'function injectStyle (ssrContext) {\n'
    if (needsHotReload) {
      styleInjectionCode += `  if (disposed) return\n`
    }
    if (isServer) {
      styleInjectionCode += `var i\n`
    }
    parts.styles.forEach(function (style, i) {
      // require style
      var requireString = style.src
        ? getRequireForImport('styles', style, style.scoped)
        : getRequire('styles', style, i, style.scoped)

      var hasStyleLoader = requireString.indexOf('style-loader') > -1
      var hasVueStyleLoader = requireString.indexOf('vue-style-loader') > -1
      // vue-style-loader exposes inject functions during SSR so they are
      // always called
      var invokeStyle = isServer && hasVueStyleLoader
        ? code => `;(i=${code},i.__inject__&&i.__inject__(ssrContext),i)\n`
        : code => `  ${code}\n`

      var moduleName = (style.module === true) ? '$style' : style.module
      // setCssModule
      if (moduleName) {
        if (!cssModules) {
          cssModules = {}
          if (needsHotReload) {
            output += `var cssModules = {}\n`
          }
        }
        if (moduleName in cssModules) {
          loaderContext.emitError('CSS module name "' + moduleName + '" is not unique!')
          styleInjectionCode += invokeStyle(requireString)
        } else {
          cssModules[moduleName] = true

          // `(vue-)style-loader` exposes the name-to-hash map directly
          // `css-loader` exposes it in `.locals`
          // add `.locals` if the user configured to not use style-loader.
          if (!hasStyleLoader) {
            requireString += '.locals'
          }

          if (!needsHotReload) {
            styleInjectionCode += invokeStyle('this["' + moduleName + '"] = ' + requireString)
          } else {
            // handle hot reload for CSS modules.
            // we store the exported locals in an object and proxy to it by
            // defining getters inside component instances' lifecycle hook.
            styleInjectionCode +=
              invokeStyle(`cssModules["${moduleName}"] = ${requireString}`) +
              `Object.defineProperty(this, "${moduleName}", { get: function () { return cssModules["${moduleName}"] }})\n`

            var requirePath = style.src
              ? getRequireForImportString('styles', style, style.scoped)
              : getRequireString('styles', style, i, style.scoped)

            output +=
              `module.hot && module.hot.accept([${requirePath}], function () {\n` +
              // 1. check if style has been injected
              `  var oldLocals = cssModules["${moduleName}"]\n` +
              `  if (!oldLocals) return\n` +
              // 2. re-import (side effect: updates the <style>)
              `  var newLocals = ${requireString}\n` +
              // 3. compare new and old locals to see if selectors changed
              `  if (JSON.stringify(newLocals) === JSON.stringify(oldLocals)) return\n` +
              // 4. locals changed. Update and force re-render.
              `  cssModules["${moduleName}"] = newLocals\n` +
              `  require("${hotReloadAPIPath}").rerender("${moduleId}")\n` +
              `})\n`
          }
        }
      } else {
        styleInjectionCode += invokeStyle(requireString)
      }
    })
    styleInjectionCode += '}\n'
    output += styleInjectionCode
  }

  // we require the component normalizer function, and call it like so:
  // normalizeComponent(
  //   scriptExports,
  //   compiledTemplate,
  //   injectStyles,
  //   scopeId,
  //   moduleIdentifier (server only)
  // )
  output += 'var normalizeComponent = require(' +
    loaderUtils.stringifyRequest(loaderContext, '!' + componentNormalizerPath) +
  ')\n'

  // <script>
  output += '/* script */\n'
  var script = parts.script
  if (script) {
    if (options.esModule) {
      output += script.src
        ? getImportForImport('script', script)
        : getImport('script', script) + '\n'
    } else {
      output += 'var __vue_script__ = ' + (script.src
        ? getRequireForImport('script', script)
        : getRequire('script', script)) + '\n'
    }
    // inject loader interop
    if (query.inject) {
      output += '__vue_script__ = __vue_script__(injections)\n'
    }
  } else {
    output += 'var __vue_script__ = null\n'
  }

  // <template>
  output += '/* template */\n'
  var template = parts.template
  if (template) {
    if (options.esModule) {
      output += (template.src
        ? getImportForImport('template', template)
        : getImport('template', template)) + '\n'
    } else {
      output += 'var __vue_template__ = ' + (template.src
        ? getRequireForImport('template', template)
        : getRequire('template', template)) + '\n'
    }
  } else {
    output += 'var __vue_template__ = null\n'
  }

  // style
  output += '/* styles */\n'
  output += 'var __vue_styles__ = ' + (parts.styles.length ? 'injectStyle' : 'null') + '\n'

  // scopeId
  output += '/* scopeId */\n'
  output += 'var __vue_scopeId__ = ' + (hasScoped ? JSON.stringify(moduleId) : 'null') + '\n'

  // moduleIdentifier (server only)
  output += '/* moduleIdentifier (server only) */\n'
  output += 'var __vue_module_identifier__ = ' + (isServer ? JSON.stringify(hash(this.request)) : 'null') + '\n'

  // close normalizeComponent call
  output += 'var Component = normalizeComponent(\n' +
    '  __vue_script__,\n' +
    '  __vue_template__,\n' +
    '  __vue_styles__,\n' +
    '  __vue_scopeId__,\n' +
    '  __vue_module_identifier__\n' +
    ')\n'

  // development-only code
  if (!isProduction) {
    // add filename in dev
    output += 'Component.options.__file = ' + JSON.stringify(shortFilePath) + '\n'
    // check named exports
    output +=
      'if (Component.esModule && Object.keys(Component.esModule).some(function (key) {' +
        'return key !== "default" && key.substr(0, 2) !== "__"' +
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

        output +=
          'var customBlock = ' + requireString + '\n' +
          'if (typeof customBlock === "function") {' +
            'customBlock(Component)' +
          '}\n'
      }
    })

    output += '\n'
  }

  if (!query.inject) {
    // hot reload
    if (needsHotReload) {
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
        '    if (module.hot.data.cssModules && Object.keys(module.hot.data.cssModules) !== Object.keys(cssModules)) {\n' +
        '      delete Component.options._Ctor\n' +
        '    }\n'
      }
      output +=
        '    hotAPI.reload("' + moduleId + '", Component.options)\n' +
        '  }\n'
      // dispose
      output +=
        '  module.hot.dispose(function (data) {\n' +
        (cssModules ? '    data.cssModules = cssModules\n' : '') +
        '    disposed = true\n' +
        '  })\n'
      output += '})()}\n'
    }
    // final export
    if (options.esModule) {
      output += '\nexport default Component.exports\n'
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

  // --- helpers ---

  function getRequire (type, part, index, scoped) {
    return 'require(' +
      getRequireString(type, part, index, scoped) +
    ')'
  }

  function getImport (type, part, index, scoped) {
    return 'import __vue_' + type + '__ from ' + getRequireString(type, part, index, scoped)
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

  function getImportForImport (type, impt, scoped) {
    return 'import __vue_' + type + '__ from ' + getRequireForImportString(type, impt, scoped)
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
      var query = loaderUtils.parseQuery($2 || '?')
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
    var lang = getLangString(type, part)
    if (preLoaders[lang]) {
      loader = loader + ensureBang(preLoaders[lang])
    }
    if (postLoaders[lang]) {
      loader = ensureBang(postLoaders[lang]) + loader
    }
    return loader
  }

  function getLangString (type, part) {
    if (type === 'script' || type === 'template' || type === 'styles') {
      return part.lang || defaultLang[type]
    } else {
      return type
    }
  }

  function getRawLoaderString (type, part, index, scoped) {
    var lang = part.lang || defaultLang[type]

    var styleCompiler = ''
    if (type === 'styles') {
      // style compiler that needs to be applied for all styles
      styleCompiler = styleCompilerPath + '?' + JSON.stringify({
        // a marker for vue-style-loader to know that this is an import from a vue file
        vue: true,
        id: moduleId,
        scoped: !!scoped,
        hasInlineConfig: !!query.postcss
      }) + '!'
      // normalize scss/sass if no specific loaders have been provided
      if (!loaders[lang]) {
        if (lang === 'sass') {
          lang = 'sass?indentedSyntax'
        } else if (lang === 'scss') {
          lang = 'sass'
        }
      }
    }

    var loader = options.extractCSS && type === 'styles'
      ? loaders[lang] || getCSSExtractLoader(lang)
      : loaders[lang]

    var injectString = (type === 'script' && query.inject)
      ? 'inject-loader!'
      : ''

    if (loader != null) {
      if (Array.isArray(loader)) {
        loader = stringifyLoaders(loader)
      } else if (typeof loader === 'object') {
        loader = stringifyLoaders([loader])
      }
      if (type === 'styles') {
        // add css modules
        loader = addCssModulesToLoader(loader, part, index)
        // inject rewriter before css loader for extractTextPlugin use cases
        if (rewriterInjectRE.test(loader)) {
          loader = loader.replace(rewriterInjectRE, function (m, $1) {
            return ensureBang($1) + styleCompiler
          })
        } else {
          loader = ensureBang(loader) + styleCompiler
        }
      }
      // if user defines custom loaders for html, add template compiler to it
      if (type === 'template' && loader.indexOf(defaultLoaders.html) < 0) {
        loader = defaultLoaders.html + '!' + loader
      }
      return injectString + ensureBang(loader)
    } else {
      // unknown lang, infer the loader to be used
      switch (type) {
        case 'template':
          return defaultLoaders.html + '!' + templatePreprocessorPath + '?engine=' + lang + '!'
        case 'styles':
          loader = addCssModulesToLoader(defaultLoaders.css, part, index)
          return loader + '!' + styleCompiler + ensureBang(ensureLoader(lang))
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
  // sass?indentedSyntax!css => sass-loader?indentedSyntax!css-loader
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

  function getCSSExtractLoader (lang) {
    var extractor
    var op = options.extractCSS
    // extractCSS option is an instance of ExtractTextPlugin
    if (typeof op.extract === 'function') {
      extractor = op
    } else {
      extractor = tryRequire('extract-text-webpack-plugin')
      if (!extractor) {
        throw new Error(
          '[vue-loader] extractCSS: true requires extract-text-webpack-plugin ' +
          'as a peer dependency.'
        )
      }
    }
    var langLoader = lang
      ? ensureBang(ensureLoader(lang))
      : ''
    return extractor.extract({
      use: 'css-loader' + cssLoaderOptions + '!' + langLoader,
      fallback: 'vue-style-loader'
    })
  }
}
