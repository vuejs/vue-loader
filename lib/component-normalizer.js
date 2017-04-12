/* globals __VUE_SSR_CONTEXT__ */

// this module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  injectStyles,
  scopeId,
  isServer
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (isServer) {
    hook = function (context) {
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      if (injectStyles) {
        injectStyles(this, context)
      }
      // TODO: register module identifier for async chunk inferrence
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    var cssModules = injectStyles({})
    if (cssModules) {
      hook = function () {
        for (var key in cssModules) {
          this[key] = cssModules[key]
        }
      }
    }
  }

  if (hook) {
    // inject component registration as beforeCreate hook
    var existing = options.beforeCreate
    options.beforeCreate = existing
      ? [].concat(existing, hook)
      : [hook]
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}
