var compiler = require('vue-template-compiler')
var transpile = require('vue-template-es2015-compiler')
var loaderUtils = require('loader-utils')
var beautify = require('js-beautify').js_beautify
var normalize = require('./normalize')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')

// vue compiler module for using transforming `<tag>:<attribute>` to `require`
var defaultTransformToRequire = {
  img: 'src'
}
var transformToRequire = Object.assign({}, defaultTransformToRequire)
var options = {
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
  var query = loaderUtils.parseQuery(this.query)
  var isServer = this.options.target === 'node'
  var vueOptions = this.vue || this.options.vue || {}
  if (vueOptions.transformToRequire) {
    Object.assign(transformToRequire, vueOptions.transformToRequire)
  }
  var compiled = compiler.compile(html, options)
  var code
  if (compiled.errors.length) {
    var self = this
    compiled.errors.forEach(function (err) {
      self.emitError('template syntax error ' + err)
    })
    code = 'module.exports={render:function(){},staticRenderFns:[]}'
  } else {
    code = transpile('module.exports={' +
      'render:' + toFunction(compiled.render) + ',' +
      'staticRenderFns: [' + compiled.staticRenderFns.map(toFunction).join(',') + ']' +
    '}')
  }
  // hot-reload
  if (!isServer &&
      !this.minimize &&
      process.env.NODE_ENV !== 'production') {
    code +=
      '\nif (module.hot) {\n' +
      '  module.hot.accept()\n' +
      '  if (module.hot.data) {\n' +
      '     require("' + hotReloadAPIPath + '").rerender("' + query.id + '", module.exports)\n' +
      '  }\n' +
      '}'
  }
  return code
}

function toFunction (code) {
  return 'function (){' + beautify(code, { indent_size: 2 }) + '}'
}
