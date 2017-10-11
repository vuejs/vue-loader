var prettier = require('prettier')
var loaderUtils = require('loader-utils')
var normalize = require('../utils/normalize')
var compiler = require('vue-template-compiler')
var transpile = require('vue-template-es2015-compiler')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')
var transformRequire = require('./modules/transform-require')

module.exports = function (html) {
  this.cacheable()
  var isServer = this.target === 'node'
  var isProduction = this.minimize || process.env.NODE_ENV === 'production'
  var vueOptions = this.options.__vueOptions__ || {}
  var options = loaderUtils.getOptions(this) || {}

  var defaultModules = [transformRequire(options.transformToRequire)]
  var userModules = vueOptions.compilerModules || options.compilerModules
  // for HappyPack cross-process use cases
  if (typeof userModules === 'string') {
    userModules = require(userModules)
  }

  var compilerOptions = {
    preserveWhitespace: options.preserveWhitespace,
    modules: defaultModules.concat(userModules || []),
    directives: vueOptions.compilerDirectives || options.compilerDirectives || {},
    scopeId: options.hasScoped ? options.id : null,
    comments: options.hasComment
  }

  var compile = isServer && compiler.ssrCompile && vueOptions.optimizeSSR !== false
    ? compiler.ssrCompile
    : compiler.compile

  var compiled = compile(html, compilerOptions)

  // tips
  if (compiled.tips && compiled.tips.length) {
    compiled.tips.forEach(tip => {
      this.emitWarning(tip)
    })
  }

  var code
  if (compiled.errors && compiled.errors.length) {
    this.emitError(
      `\n  Error compiling template:\n${pad(html)}\n` +
      compiled.errors.map(e => `  - ${e}`).join('\n') + '\n'
    )
    code = vueOptions.esModule
      ? `var esExports = {render:function(){},staticRenderFns: []}\nexport default esExports`
      : 'module.exports={render:function(){},staticRenderFns:[]}'
  } else {
    var bubleOptions = options.buble
    var stripWith = bubleOptions.transforms.stripWith !== false
    var stripWithFunctional = bubleOptions.transforms.stripWithFunctional

    var staticRenderFns = compiled.staticRenderFns.map((fn) => toFunction(fn, stripWithFunctional))

    code = transpile(
      'var render = ' + toFunction(compiled.render, stripWithFunctional) + '\n' +
      'var staticRenderFns = [' + staticRenderFns.join(',') + ']',
      bubleOptions
    ) + '\n'

    // prettify render fn
    if (!isProduction) {
      code = prettier.format(code, { semi: false })
    }

    // mark with stripped (this enables Vue to use correct runtime proxy detection)
    if (!isProduction && stripWith) {
      code += `render._withStripped = true\n`
    }
    var exports = `{ render: render, staticRenderFns: staticRenderFns }`
    code += vueOptions.esModule
      ? `var esExports = ${exports}\nexport default esExports`
      : `module.exports = ${exports}`
  }
  // hot-reload
  if (!isServer && !isProduction) {
    var exportsName = vueOptions.esModule ? 'esExports' : 'module.exports'
    code +=
      '\nif (module.hot) {\n' +
      '  module.hot.accept()\n' +
      '  if (module.hot.data) {\n' +
      '     require("' + hotReloadAPIPath + '").rerender("' + options.id + '", ' + exportsName + ')\n' +
      '  }\n' +
      '}'
  }

  return code
}

function toFunction (code, stripWithFunctional) {
  return 'function (' + (stripWithFunctional ? '_h,_vm' : '') + ') {' + code + '}'
}

function pad (html) {
  return html.split(/\r?\n/).map(line => `  ${line}`).join('\n')
}
