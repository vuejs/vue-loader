var stylus = require('stylus')

module.exports = function (raw) {
  var css
  // stylus has a seemingly async API
  // but it is actually called synchronously
  stylus.render(raw, {}, function (e, res) {
    if (e) {
      console.warn('stylus compilation error:\n  ' + e.toString())
    }
    css = res
  })
  return css
}