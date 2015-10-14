// override component directive's resolveComponent function.
// When component is resolved:
//   - remove self from previous component's list
//   - add self to current component's list

var shimmed = false
module.exports = function (Vue) {
  if (shimmed) return
  shimmed = true
  console.log('[HMR] Vue component hot reload shim applied.')
  var map = window.map = Vue.config._hotComponents = Object.create(null)
  var componentDir = Vue.internalDirectives.component
  var resolve = componentDir.resolveComponent
  componentDir.resolveComponent = function (id, cb) {
    var view = this
    var prevComponent = view.Component
    var prevId = prevComponent && prevComponent.options.hotID
    resolve.call(this, id, function () {
      var Component = view.Component
      var newId = Component.options.hotID
      if (prevId) {
        map[prevId].instances.$remove(view)
      }
      if (newId) {
        if (!map[newId]) {
          map[newId] = {
            Ctor: Component,
            instances: []
          }
        }
        map[newId].instances.push(view)
      }
      cb()
    })
  }
}
