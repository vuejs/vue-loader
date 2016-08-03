var compiler = require('vue-template-compiler')
var loaderUtils = require('loader-utils')
var beautify = require('js-beautify').js_beautify
var normalize = require('./normalize')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')

// vue compiler module for using file-loader img src
var options = {
  modules: [{
    postTransformNode (el) {
      if (el.tag === 'img') {
        el.attrs && el.attrs.some(rewrite)
      }
    }
  }]
}

function rewrite (attr) {
  if (attr.name === 'src') {
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
  var isServer = this.options.target === 'node'
  var compiled = compiler.compile(html, options)
  var code
  if (compiled.errors.length) {
    var self = this
    compiled.errors.forEach(function (err) {
      self.emitError('template syntax error ' + err)
    })
    code = 'module.exports={render:function(){},staticRenderFns:[]}'
  } else {
    code = 'module.exports={' +
      'render:' + toFunction(compiled.render) + ',' +
      'staticRenderFns: [' + compiled.staticRenderFns.map(toFunction).join(',') + ']' +
    '}'
  }
  // hot-reload
  if (!isServer &&
      !this.minimize &&
      process.env.NODE_ENV !== 'production') {
    var moduleId = loaderUtils.parseQuery(this.query).id
    code +=
      '\nif (module.hot) {\n' +
      '  module.hot.accept()\n' +
      '  if (module.hot.data) {\n' +
      '     require("' + hotReloadAPIPath + '").rerender("' + moduleId + '", module.exports)\n' +
      '  }\n' +
      '}'
  }
  return code
}

function toFunction (code) {
  return 'function(){' +
    beautify(code, { indent_size: 2 }) +
  '}'
}
