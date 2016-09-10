var cons = require('consolidate')
var loaderUtils = require('loader-utils')
var extname = require('path').extname

module.exports = function (content) {
  this.cacheable && this.cacheable()
  var callback = this.async()
  var opt = loaderUtils.parseQuery(this.query)
  var renderOpts = {}
  try {
    renderOpts = JSON.parse(opt.opt)
  } catch (e) {
    try {
      renderOpts = require(opt.opt)
    } catch (e) {}
  }
  var vue = this.options.vue
  if (vue && vue.template) {
    for (var key in vue.template) {
      renderOpts[key] = vue.template[key]
    }
  }
  function exportContent (content) {
    if (opt.raw) {
      callback(null, content)
    } else {
      callback(null, 'module.exports = ' + JSON.stringify(content))
    }
  }

  // with no engine given, use the file extension as engine
  if (!opt.engine) {
    opt.engine = extname(this.request).substr(1).toLowerCase()
  }

  if (!cons[opt.engine]) {
    return callback(new Error(
      'Template engine \'' + opt.engine + '\' ' +
      'isn\'t available in Consolidate.js'
    ))
  }

  // for relative includes
  opt.filename = this.resourcePath

  cons[opt.engine].render(content, renderOpts, function (err, html) {
    if (err) {
      callback(err)
    } else {
      exportContent(html)
    }
  })
}
