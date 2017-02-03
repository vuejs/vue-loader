// utility for generating a uid for each component file
// used in scoped CSS rewriting
var path = require('path')
var hash = require('hash-sum')
var cache = Object.create(null)

module.exports = function genId (file, context) {
  context = context || process.cwd()
  var contextPath = context.split(path.sep)
  var rootId = contextPath[contextPath.length - 1]
  file = rootId + '/' + path.relative(context, file)
  return cache[file] || (cache[file] = hash(file))
}
