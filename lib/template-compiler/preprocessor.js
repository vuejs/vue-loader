// loader for pre-processing templates with e.g. pug

var cons = require('consolidate')
var loaderUtils = require('loader-utils')
var MarkdownIt = require('markdown-it')

module.exports = function (content) {
  this.cacheable && this.cacheable()
  var callback = this.async()
  var opt = loaderUtils.getOptions(this) || {}

  if (!cons[opt.engine] && opt.engine !== 'markdown' && opt.engine !== 'md') {
    return callback(new Error(
      'Template engine \'' + opt.engine + '\' ' +
      'isn\'t available in Consolidate.js'
    ))
  }

  // allow passing options to the template preprocessor via `template` option
  if (this.options.__vueOptions__) {
    Object.assign(opt, this.options.__vueOptions__.template)
  }

  // for relative includes
  opt.filename = this.resourcePath

  switch (opt.engine) {
    case 'md':
    case 'markdown':
      var md = new MarkdownIt()
      callback(null, '<div>' + md.render(content) + '</div>')
      break
    default:
      cons[opt.engine].render(content, opt, function (err, html) {
        if (err) {
          return callback(err)
        }
        callback(null, html)
      })
  }
}
