var compiler = require('vue-template-compiler')

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
  if (compiled.errors.length) {
    var self = this
    compiled.errors.forEach(function (err) {
      self.emitError('template syntax error ' + err)
    })
    return 'module.exports={render:function(){},staticRenderFns:[]}'
  }
  return 'module.exports={' +
    'render:' + toFunction(compiled.render) + ',' +
    'staticRenderFns: [' + compiled.staticRenderFns.map(toFunction).join(',') + ']' +
  '}'
}

function toFunction (code) {
  return 'function(){' + code + '}'
}
