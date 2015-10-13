// keep track of unique ids for component modules.

var ids = Object.create(null)
var count = 0

exports.get = function (path) {
  var id = ids[path]
  if (!id) {
    id = ids[path] = ++count
  }
  return '_v-' + id
}
