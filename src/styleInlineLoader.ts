import webpack = require('webpack')

const StyleInineLoader: webpack.loader.Loader = function (source) {
  // TODO minify this?
  return `export default ${JSON.stringify(source)}`
}

export default StyleInineLoader
