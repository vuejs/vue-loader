var compiler = require('vue-template-compiler')
var cache = require('lru-cache')(100)
var hash = require('hash-sum')

module.exports = function (content, filename, needMap) {
  var cacheKey = hash(filename + content)
  // source-map cache busting for hot-reloadded modules
  var filenameWithHash = filename + '?' + cacheKey
  var output = cache.get(cacheKey)
  if (output) return output
  output = compiler.parseComponent(content, {
    pad: true,
    map: needMap
      ? { filename: filenameWithHash }
      : false
  })
  cache.set(cacheKey, output)
  return output
}
