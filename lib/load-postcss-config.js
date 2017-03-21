var load = require('postcss-load-config')

let postcssrc

module.exports = function loadPostcssConfig () {
  if (process.env.VUE_LOADER_TEST || !postcssrc) {
    return (postcssrc = load({}, null, { argv: false }).catch(() => {
      // postcss-load-config throws error when no config file is found,
      // but for us it's optional.
    }))
  } else {
    return postcssrc
  }
}
