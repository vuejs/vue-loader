var coffee = require('coffee-script')

module.exports = function (raw) {
  try {
    var js = coffee.compile(raw, {
      bare: true
    })
  } catch (e) {
    console.warn(
      'coffee-script compilation error:\n  ' +
      e.toString()
    )
  }
  return js
}