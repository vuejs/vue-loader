var compiler = require('vue-component-compiler')

compiler.loadConfig()

module.exports = function(content) {
  this.cacheable && this.cacheable()
  var cb = this.async()
  compiler.compile(content, this.resourcePath, function(err, result) {
    if(err) return cb(err)
    cb(null, result)
  })
}
