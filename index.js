var compiler = require('vue-component-compiler')

module.exports = function (content) {
  this.cacheable && this.cacheable()
  var data
  compiler.compile(content, function (err, res) {
    if (err) throw err
    data = res
  })
  return data
}