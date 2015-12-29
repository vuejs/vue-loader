var parse = require('./parser')
var loaderUtils = require('loader-utils')

module.exports = function (content) {
  this.cacheable()
  var query = loaderUtils.parseQuery(this.query)
  var parts = parse(content)
  return parts[query.type][query.index].content
}
