var loaderUtils = require('loader-utils')
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

var babelLoader
function getBabel () {
  if (babelLoader || babelLoader === null) return babelLoader
  try {
    babelLoader = require('babel-loader')
  } catch (e) {
    babelLoader = null
  }

  return babelLoader
}

var bubleLoader
function getBuble () {
  if (bubleLoader || bubleLoader === null) return bubleLoader
  try {
    bubleLoader = require('buble-loader')
  } catch (e) {
    bubleLoader = null
  }

  return bubleLoader
}

var rewriterInjectRE = /\b(css(?:-loader)?(?:\?[^!]+)?)(?:!|$)/

var defaultLang = {
  template: 'html',
  styles: 'css',
  script: 'js'
}

var checkNamedExports =
  'if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {' +
  'console.error("named exports are not supported in *.vue files.")}\n'

class VueLoader {
  constructor (filePath, options) {
    this.filePath = filePath
    this.options = options

    this.isServer = this.options.target === 'node'
    this.query = loaderUtils.parseQuery(options.query)

    this.fileName = path.basename(filePath)
    this.moduleId = 'data-v-' + genId(filePath)
    this.styleRewriter = styleRewriterPath + '?id=' + this.moduleId
    this.isProduction = options.minimize || process.env.NODE_ENV === 'production'

    this.needCssSourceMap =
      !this.isProduction &&
      this.sourceMap &&
      options.cssSourceMap !== false

    this.bubleOptions = getBuble() && options.buble ? '?' + JSON.stringify(options.buble) : ''
    this.defaultLoaders = {
      html: templateCompilerPath + '?id=' + this.moduleId,
      css: (this.isServer ? '' : styleLoaderPath + '!') + 'css-loader' + (this.needCssSourceMap ? '?sourceMap' : ''),
      js: getBuble() ? ('buble-loader' + this.bubleOptions) : getBabel() ? 'babel-loader' : ''
    }

    // check if there are custom loaders specified via
    // webpack config, otherwise use defaults
    this.loaders = Object.assign({}, this.defaultLoaders, options.loaders)
  }

  render (content, loaderContext) {
    var parts = parse(content, this.fileName, this.sourceMap)
    var hasScoped = parts.styles.some(function (s) { return s.scoped })
    var output = 'var __vue_exports__, __vue_options__\n'

    // css modules
    output += 'var __vue_styles__ = {}\n'
    var cssModules = {}

    // add requires for styles
    if (parts.styles.length) {
      output += '\n/* styles */\n'
      parts.styles.forEach((style, i) => {
        var moduleName = (style.module === true) ? '$style' : style.module

        // require style
        if (this.isServer && !moduleName) return
        var requireString = style.src
          ? this.getRequireForImport('styles', style, style.scoped, loaderContext)
          : this.getRequire('styles', style, i, style.scoped, loaderContext)

        // setCssModule
        if (moduleName) {
          if (moduleName in cssModules) {
            loaderContext.emitError('CSS module name "' + moduleName + '" is not unique!')
            output += requireString
          } else {
            cssModules[moduleName] = true

            // `style-loader` exposes the name-to-hash map directly
            // `css-loader` exposes it in `.locals`
            // We drop `style-loader` in SSR, and add `.locals` here.
            if (this.isServer) {
              requireString += '.locals'
            }

            output += '__vue_styles__["' + moduleName + '"] = ' + requireString + '\n'
          }
        } else {
          output += requireString
        }
      })
    }

    // add require for script
    var script = parts.script
    if (script) {
      output += '\n/* script */\n'
      output +=
        '__vue_exports__ = ' + (
          script.src
            ? this.getRequireForImport('script', script, null, loaderContext)
            : this.getRequire('script', script, null, null, loaderContext)
        )
    }

    var exports =
      '__vue_options__ = __vue_exports__ = __vue_exports__ || {}\n' +
      // ES6 modules interop
      'if (\n' +
      '  typeof __vue_exports__.default === "object" ||\n' +
      '  typeof __vue_exports__.default === "function"\n' +
      ') {\n' +
        (this.isProduction ? '' : checkNamedExports) +
        '__vue_options__ = __vue_exports__ = __vue_exports__.default\n' +
      '}\n' +
      // constructor export interop
      'if (typeof __vue_options__ === "function") {\n' +
      '  __vue_options__ = __vue_options__.options\n' +
      '}\n' +
      // add filename in dev
      (this.isProduction ? '' : ('__vue_options__.__file = ' + JSON.stringify(this.filePath))) + '\n'

    // add component name based on the filename
    exports +=
      'if(typeof __vue_options__.name === "undefined") {\n' +
      '  __vue_options__.name = ' + JSON.stringify(path.parse(this.filePath).name) + '\n' +
      '}'

    // add require for template
    var template = parts.template
    if (template) {
      output += '\n/* template */\n'
      output += 'var __vue_template__ = ' + (
        template.src
          ? this.getRequireForImport('template', template, null, loaderContext)
          : this.getRequire('template', template, null, null, loaderContext)
      )
      // attach render functions to exported options
      exports +=
        '__vue_options__.render = __vue_template__.render\n' +
        '__vue_options__.staticRenderFns = __vue_template__.staticRenderFns\n'
    }

    // attach scoped id
    if (hasScoped) {
      exports += '__vue_options__._scopeId = "' + this.moduleId + '"\n'
    }

    if (Object.keys(cssModules).length) {
      // inject style modules as computed properties
      exports +=
        'if (!__vue_options__.computed) __vue_options__.computed = {}\n' +
        'Object.keys(__vue_styles__).forEach(function (key) {\n' +
          'var module = __vue_styles__[key]\n' +
          '__vue_options__.computed[key] = function () { return module }\n' +
        '})\n'
    }

    if (!this.query.inject) {
      output += exports
      // hot reload
      if (
        !this.isServer &&
        !this.isProduction &&
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
          '    hotAPI.createRecord("' + this.moduleId + '", __vue_options__)\n' +
          '  } else {\n' +
          // update
          '    hotAPI.reload("' + this.moduleId + '", __vue_options__)\n' +
          '  }\n' +
          '})()}\n'
      }
      // check functional components used with templates
      if (!this.isProduction) {
        output +=
          'if (__vue_options__.functional && typeof __vue_template__ !== "undefined") {' +
            'console.error("' +
            `[vue-loader] ${this.fileName}: functional components are not ` +
            'supported with templates, they should use render functions.' +
          '")}\n'
      }
      // final export
      if (this.options.esModule) {
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

  getRequire (type, part, index, scoped, loaderContext) {
    return 'require(' +
      this.getRequireString(type, part, index, scoped, loaderContext) +
    ')\n'
  }

  getRequireString (type, part, index, scoped, loaderContext) {
    return loaderUtils.stringifyRequest(loaderContext,
      // disable all configuration loaders
      '!!' +
      // get loader string for pre-processors
      this.getLoaderString(type, part, index, scoped) +
      // select the corresponding part from the vue file
      this.getSelectorString(type, index || 0) +
      // the url to the actual vuefile
      this.filePath
    )
  }

  getRequireForImport (type, impt, scoped, loaderContext) {
    return 'require(' +
      this.getRequireForImportString(type, impt, scoped, loaderContext) +
    ')\n'
  }

  getRequireForImportString (type, impt, scoped, loaderContext) {
    return loaderUtils.stringifyRequest(loaderContext,
      '!!' +
      this.getLoaderString(type, impt, -1, scoped) +
      impt.src
    )
  }

  addCssModulesToLoader (loader, part, index) {
    if (!part.module) return loader
    var option = this.options.cssModules || {}
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

  getLoaderString (type, part, index, scoped) {
    var lang = part.lang || defaultLang[type]
    var loader = this.loaders[lang]
    var rewriter = type === 'styles' ? this.styleRewriter + (scoped ? '&scoped=true!' : '!') : ''
    var injectString = (type === 'script' && this.query.inject) ? 'inject-loader!' : ''
    if (loader !== undefined) {
      // add css modules
      if (type === 'styles') {
        loader = this.addCssModulesToLoader(loader, part, index)
      }
      // inject rewriter before css/html loader for
      // extractTextPlugin use cases
      if (rewriterInjectRE.test(loader)) {
        loader = loader.replace(rewriterInjectRE, (m, $1) => {
          return this.ensureBang($1) + rewriter
        })
      } else {
        loader = this.ensureBang(loader) + rewriter
      }
      return injectString + this.ensureBang(loader)
    } else {
      // unknown lang, infer the loader to be used
      switch (type) {
        case 'template':
          return this.defaultLoaders.html + '!' + templateLoaderPath + '?raw&engine=' + lang + '!'
        case 'styles':
          loader = this.addCssModulesToLoader(this.defaultLoaders.css, part, index)
          return loader + '!' + rewriter + this.ensureBang(this.ensureLoader(lang))
        case 'script':
          return injectString + this.ensureBang(this.ensureLoader(lang))
      }
    }
  }

  // sass => sass-loader
  // sass-loader => sass-loader
  // sass?indentedsyntax!css => sass-loader?indentedSyntax!css-loader
  ensureLoader (lang) {
    return lang.split('!').map(function (loader) {
      return loader.replace(/^([\w-]+)(\?.*)?/, function (_, name, query) {
        return (/-loader$/.test(name) ? name : (name + '-loader')) + (query || '')
      })
    }).join('!')
  }

  getSelectorString (type, index) {
    return selectorPath +
      '?type=' + type +
      '&index=' + index + '!'
  }

  ensureBang (loader) {
    if (loader.charAt(loader.length - 1) !== '!') {
      return loader + '!'
    } else {
      return loader
    }
  }
}

module.exports = function (content) {
  this.cacheable()
  var loaderContext = this
  var query = loaderUtils.parseQuery(loaderContext.query)
  var options = this.options.__vueOptions__ = Object.assign(
    {},
    this.options.vue, this.vue,
    query,
    { target: loaderContext.target, isProduction: loaderContext.isProduction })

  options.query = query

  var vueLoader = new VueLoader(this.resourcePath, options)

  var ret = vueLoader.render(content, loaderContext)
  return ret
}

module.exports.VueLoader = VueLoader
