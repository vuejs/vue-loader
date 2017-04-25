var fs = require('fs')
var path = require('path')
var cwd = process.cwd()

// attempts to first require a dep using projects cwd (when vue-loader is linked)
// then try a normal require.
module.exports = function tryRequire (dep) {
  var cwdPath = path.resolve(cwd, 'node_modules', dep)
  if (fs.existsSync(cwdPath)) {
    return require(cwdPath)
  } else {
    try {
      return require(dep)
    } catch (e) {}
  }
}
