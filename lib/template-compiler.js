var compiler = require('vue-template-compiler')
var transpile = require('vue-template-es2015-compiler')
var loaderUtils = require('loader-utils')
var beautify = require('js-beautify').js_beautify
var normalize = require('./normalize')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')

// vue compiler module for using transforming `<tag>:<attribute>` to `require`
var defaultTransformToRequire = {
  img: 'src',
  image: 'xlink:href'
}
var transformToRequire = defaultTransformToRequire
var defaultCompileOptions = {
  modules: [{
    postTransformNode (el) {
      for (var tag in transformToRequire) {
        if (el.tag === tag && el.attrs) {
          var attributes = transformToRequire[tag]
          if (typeof attributes === 'string') {
            el.attrs.some(attr => rewrite(attr, attributes))
          } else if (Array.isArray(attributes)) {
            attributes.forEach(item => el.attrs.some(attr => rewrite(attr, item)))
          }
        }
      }
    }
  }]
}

function rewrite (attr, name) {
  if (attr.name === name) {
    var value = attr.value
    var isStatic = value.charAt(0) === '"' && value.charAt(value.length - 1) === '"'
    if (!isStatic) {
      return
    }
    var firstChar = value.charAt(1)
    if (firstChar === '.' || firstChar === '~') {
      if (firstChar === '~') {
        value = '"' + value.slice(2)
      }
      attr.value = `require(${value})`
    }
    return true
  }
}

module.exports = function (html) {
  this.cacheable()
  var isServer = this.target === 'node'
  var isProduction = this.minimize || process.env.NODE_ENV === 'production'
  var options = loaderUtils.parseQuery(this.query)
  if (options.transformToRequire) {
    transformToRequire = Object.assign(
      {},
      defaultTransformToRequire,
      options.transformToRequire
    )
  }
  var compiled = compiler.compile(html, Object.assign({
    preserveWhitespace: options.preserveWhitespace
  }, defaultCompileOptions))
  var code
  if (compiled.errors.length) {
    this.emitError(
      `\n  Error compiling template:\n${pad(html)}\n` +
      compiled.errors.map(e => `  - ${e}`).join('\n') + '\n'
    )
    code = 'module.exports={render:function(){},staticRenderFns:[]}'
  } else {
    var bubleOptions = options.buble
    code = transpile('module.exports={' +
      'render:' + toFunction(compiled.render) + ',' +
      'staticRenderFns: [' + compiled.staticRenderFns.map(toFunction).join(',') + ']' +
    '}', bubleOptions)
    // mark with stripped (this enables Vue to use correct runtime proxy detection)
    if (!isProduction && (
      !bubleOptions ||
      !bubleOptions.transforms ||
      bubleOptions.transforms.stripWith !== false
    )) {
      code += `\nmodule.exports.render._withStripped = true`
    }
  }
  // hot-reload
  if (!isServer &&
      !this.minimize &&
      process.env.NODE_ENV !== 'production') {
    code +=
      '\nif (module.hot) {\n' +
      '  module.hot.accept()\n' +
      '  if (module.hot.data) {\n' +
      '     require("' + hotReloadAPIPath + '").rerender("' + options.id + '", module.exports)\n' +
      '  }\n' +
      '}'
  }
  return code
}

function toFunction (code) {
  return 'function (){' + beautify(code, {
    indent_size: 2 // eslint-disable-line camelcase
  }) + '}'
}

function pad (html) {
  return html.split(/\r?\n/).map(line => `  ${line}`).join('\n')
}
