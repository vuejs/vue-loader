var less = require('less')

module.exports = function (raw) {
  var css
  // less has a seemingly async API
  // but it is actually called synchronously
  less.render(raw, function (e, res) {
    if (e) {
      console.warn('less compilation error:\n  ' + e.toString())
    }
    css = res
  })
  return css
}