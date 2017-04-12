/* globals __VUE_SSR_CONTEXT__ */

// this module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  injectStyles,
  scopeId
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

  var existing = options.beforeCreate
  var registerComponent = function (context) {
    if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
      context = __VUE_SSR_CONTEXT__
    }
    if (injectStyles) {
      injectStyles(this, context)
    }
  }

  // inject component registration as beforeCreate hook
  options.beforeCreate = existing
    ? [].concat(existing, registerComponent)
    : [registerComponent]

  // used by ssr in case component is cached and beforeCreate
  // never gets called
  options._ssrRegister = registerComponent

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}
