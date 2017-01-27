var IS_TEST = !!process.env.VUE_LOADER_TEST
var fs = require('fs')
var path = require('path')

exports.lib = function (file) {
  if (IS_TEST) {
    return path.resolve(__dirname, file)
  } else {
    return path.resolve(__dirname, file)

  }
}

exports.dep = function (dep) {
  if (IS_TEST) {
    return dep
  } else if (fs.existsSync(path.resolve(__dirname, '../node_modules', dep))) {
    // npm 2 or npm linked
    return path.resolve(__dirname, '../node_modules', dep)
  } else {
    // npm 3
    return dep
  }
}
