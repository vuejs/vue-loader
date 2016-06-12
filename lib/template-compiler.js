var compiler = require('vue-template-compiler')
var loaderUtils = require('loader-utils')
var normalize = require('./normalize')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')

// vue compiler module for using file-loader img src
var options = {
  modules: [{
    postTransformNode (el) {
      if (el.tag === 'img') {
        el.staticAttrs && el.staticAttrs.some(rewrite)
      }
    }
  }]
}

function rewrite (attr) {
  if (attr.name === 'src') {
    var firstChar = attr.value.charAt(1)
    if (firstChar === '.' || firstChar === '~') {
      if (firstChar === '~') {
        attr.value = '"' + attr.value.slice(2)
      }
      attr.value = `require(${attr.value})`
    }
    return true
  }
}

module.exports = function (html) {
  this.cacheable()
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
  if (!this.minimize &&
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
  return 'function(){' + code + '}'
}
