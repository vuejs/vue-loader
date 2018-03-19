const hotReloadAPIPath = require.resolve('vue-hot-reload-api')

module.exports = function genHotReloadCode (id, functional) {
  // TODO handle CSSModules and style injection disposal
  return `
/* hot reload */
if (module.hot) {
  var api = require('${hotReloadAPIPath}')
  api.install(require('vue'))
  if (api.compatible) {
    module.hot.accept()
    if (!module.hot.data) {
      api.createRecord('${id}', component.options)
    } else {
      api.${functional ? `rerender` : `reload`}('${id}', component.options)
    }
  }
}
  `.trim()
}
