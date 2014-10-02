var jade = require('jade')

module.exports = function (raw) {
  try {
    var html = jade.compile(raw)({})
  } catch (e) {
    console.warn('jade compilation error:\n  ' + e.toString())
  }
  return html
}