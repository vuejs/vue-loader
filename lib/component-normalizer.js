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

  if (injectStyles) {
    var injected = false
    var cssModules
    var inject = function () {
      if (!injected) {
        injected = true
        cssModules = injectStyles()
      }
      // inject cssModules
      if (cssModules) {
        for (var key in cssModules) {
          this[key] = cssModules[key]
        }
      }
    }
    var existing = options.beforeCreate
    options.beforeCreate = existing
      ? [].concat(existing, inject)
      : [inject]
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}
