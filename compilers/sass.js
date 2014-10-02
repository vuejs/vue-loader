var sass = require('node-sass')

module.exports = function (raw) {
  try {
    var css = sass.renderSync({
      data: raw,
      options: {
        sourceComments: 'normal'
      }
    })
  } catch (e) {
    console.warn('sass compilation error:\n  ' + e.toString())
  }
  return css
}