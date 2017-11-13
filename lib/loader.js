var path = require('path')
var genId = require('./utils/gen-id')
var querystring = require('querystring')
var loaderUtils = require('loader-utils')
var normalize = require('./utils/normalize')
var tryRequire = require('./utils/try-require')
var compiler = require('vue-component-compiler')

// internal lib loaders
var selectorPath = normalize.lib('selector')
var styleCompilerPath = normalize.lib('style-compiler/index')
var templateCompilerPath = normalize.lib('template-compiler/index')
var templatePreprocessorPath = normalize.lib('template-compiler/preprocessor')

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
    esModule: true,
    isHot: !isServer && !isProduction,
    isServer,
    isProduction,
    isInjectable: query.inject,
    hasStyleInjectFn: true,
    require: {
      vueHotReloadAPI: hotReloadAPIPath
    }
  }, this.options.vue, this.vue, query)

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

  options.moduleIdentifier = options.scopeId = moduleId

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

  var templateCompilerOptions = '?' + JSON.stringify({
    id: moduleId,
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

  function getRequireForImportString (type, impt, scoped) {
    return loaderUtils.stringifyRequest(loaderContext,
      '!!' +
      getLoaderString(type, impt, -1, scoped) +
      impt.src
    )
  }

  function unwrap (any) {
    if (typeof any === 'string') {
      return JSON.parse(any)
    }

    return any
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
      return (part && part.lang) || defaultLang[type]
    } else {
      return type
    }
  }

  function getRawLoaderString (type, part, index, scoped) {
    var lang = (part && part.lang) || defaultLang[type]

    var styleCompiler = ''
    if (type === 'styles') {
      // style compiler that needs to be applied for all styles
      styleCompiler = styleCompilerPath + '?' + JSON.stringify({
        // a marker for vue-style-loader to know that this is an import from a vue file
        vue: true,
        id: moduleId,
        scoped: !!scoped,
        module: part && part.module,
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

  const parts = compiler.parse(content, fileName, { needsMap: this.sourceMap })

  const output = compiler.assemble(
    {
      script: {
        id: parts.script && unwrap(parts.script.src
          ? getRequireForImportString('script', parts.script)
          : getRequireString('script', parts.script)),
        descriptor: parts.script
      },
      render: {
        id: parts.template && unwrap(parts.template.src
          ? getRequireForImportString('template', parts.template)
          : getRequireString('template', parts.template)),
        descriptor: parts.template
      },
      styles: parts.styles && parts.styles.map(
        (style, i) => ({
          id: style && unwrap(style.src
            ? getRequireForImportString('styles', style, i, style.scoped)
            : getRequireString('styles', style, i, style.scoped)),
          descriptor: style
        })
      ),
      customBlocks: parts.customBlocks && parts.customBlocks.map(
        (block, i) => ({
          id: block && unwrap(block.src
            ? getRequireForImportString(block.type, block)
            : getRequireString(block.type, block, i)),
          descriptor: block
        })
      )
    }, shortFilePath, options
  )

  return output
}
