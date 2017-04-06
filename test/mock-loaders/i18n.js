module.exports = function (source) {
  var value = typeof source === 'string' ? JSON.parse(source) : source
  var jsonString = JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
  var code = 'module.exports = function (Component) { Component.options.__i18n = ' + JSON.stringify(jsonString) + ' }'
  this.callback(null, code)
}
