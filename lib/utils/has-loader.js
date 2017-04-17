var fs = require('fs')
var path = require('path')
var cwd = process.cwd()

module.exports = function (loader) {
  loader += '-loader'
  var hasLoader = false
  try {
    hasLoader = !!require(loader)
  } catch (e) {}
  if (!hasLoader) {
    hasLoader = fs.existsSync(path.resolve(cwd, 'node_modules', loader))
  }
  return hasLoader
}
