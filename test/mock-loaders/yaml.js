var yaml = require('js-yaml')

module.exports = function (source) {
  this.cacheable && this.cacheable()
  var res = yaml.safeLoad(source)
  return JSON.stringify(res)
}
