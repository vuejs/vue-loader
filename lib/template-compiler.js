var compiler = require('vue-template-compiler')
var loaderUtils = require('loader-utils')
var beautify = require('js-beautify').js_beautify
var normalize = require('./normalize')
var hotReloadAPIPath = normalize.dep('vue-hot-reload-api')

// vue compiler module for using transforming `<tag>:<attribute>` to `require`
var defaultTransformToRequire = {
  img: 'src'
}
var transformToRequire = Object.assign({}, defaultTransformToRequire);
var options = {
  modules: [{
    postTransformNode (el) {
      for (var key in transformToRequire) {
        if (el.tag === key) {
          el.attrs && el.attrs.some(attr => rewrite(attr, transformToRequire[key]))
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
  if (this.options.vue && this.options.vue.transformToRequire) {
    Object.assign(transformToRequire, this.options.vue.transformToRequire)
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
    code = 'module.exports={' +
      'render:' + toFunction(compiled.render, query.babel) + ',' +
      'staticRenderFns: [' + compiled.staticRenderFns.map(function (code) {
        return toFunction(code, query.babel)
      }).join(',') + ']' +
    '}'

    if (query.babel) {
      var babelOptions = {
        filename: require('path').basename(this.resourcePath),
        sourceRoot: process.cwd(),
        babelrc: true
      }
      if (this.options.babel) {
        for (var key in this.options.babel) {
          babelOptions[key] = this.options.babel[key]
        }
      }
      code = transpile(code, babelOptions)
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
      '     require("' + hotReloadAPIPath + '").rerender("' + query.id + '", module.exports)\n' +
      '  }\n' +
      '}'
  }
  return code
}

function transpile (code, options) {
  return require('babel-core').transform(code, options).code
    // strip use strict
    .replace(/['"]use strict['"];?\n?/, '')
    // add back with
    .replace(/if\s*\("__VUE_LOADER_WITH__"\)/g, 'with(this)')
}

function toFunction (code, needBabel) {
  if (needBabel) {
    // replace "with(this){" with something that works in strict mode
    code = code.replace(/with\(this\)/, 'if("__VUE_LOADER_WITH__")')
  }
  return 'function (){' + beautify(code, { indent_size: 2 }) + '}'
}
