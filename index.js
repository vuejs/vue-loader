var compiler = require('vue-component-compiler')

compiler.loadConfig()

module.exports = function(content) {
  var ctx = this
  var cb = ctx.async()
  ctx.cacheable && ctx.cacheable()

  var deps = {}
  compiler.on('dependency', addDep)
  function addDep (filePath) {
    if (!deps[filePath]) {
      deps[filePath] = true
      ctx.addDependency(filePath)
    }
  }

  compiler.compile(content, ctx.resourcePath, function(err, result) {
    compiler.removeListener('dependency', addDep)
    if(err) return cb(err)
    cb(null, result)
  })
}
