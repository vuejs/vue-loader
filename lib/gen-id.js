// utility for generating a uid for each component file
// used in scoped CSS rewriting
var fileUid = 1
var fileRegistry = Object.create(null)

module.exports = function genId (file) {
  return fileRegistry[file] || (fileRegistry[file] = fileUid++)
}
