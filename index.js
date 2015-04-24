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
    if(err) return cb(err)
    compiler.removeListener('dependency', addDep)
    cb(null, result)
  })
}
