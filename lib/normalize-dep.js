var fs = require('fs')
var path = require('path')

module.exports = function normalizeDepPath (dep) {
  if (fs.existsSync(path.resolve(__dirname, '../node_modules', dep))) {
    // npm 2 or npm linked
    return 'vue-loader/node_modules/' + dep
  } else {
    // npm 3
    return dep
  }
}
