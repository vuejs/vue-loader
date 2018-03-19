function normalize (code) {
  return code.split(/\r?\n/).map(function (line) { return line }).join('')
}

module.exports = function (source) {
  var code = "module.exports = function (Component) { Component.options.__blog = '" + source + "' }"
  return normalize(code)
}
