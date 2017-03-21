// TODO: apply same postcss processing to inline styles inside templates

// 1. load postcss config
// 2. transform staticStyle?

var loadPostcssConfig = require('../../style-compiler/load-postcss-config')

module.exports = () => {
  return loadPostcssConfig().then(config => {
    return {}
  })
}
