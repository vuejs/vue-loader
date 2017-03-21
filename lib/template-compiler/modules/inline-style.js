// 1. load postcss config
// 2. transform staticStyle?
var loadPostcssConfig = require('../../style-compiler/load-postcss-config')

module.exports = () => {
  return loadPostcssConfig().then(config => {
    return {}
  })
}
