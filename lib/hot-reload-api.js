/**
 * override component directive's resolveComponent function.
 * When component is resolved:
 *   - remove self from previous component's list
 *   - add self to current component's list
 */

var shimmed = false
exports.install = function (Vue) {
  if (shimmed) return
  shimmed = true

  exports.compatible = !!Vue.internalDirectives
  if (!exports.compatible) {
    console.warn(
      '[HMR] vue-loader hot reload is only compatible with ' +
      'Vue.js 1.0.0+.'
    )
    return
  }

  // create global hot reload map
  var map = Vue.config._hotComponents = Object.create(null)
  // check compatibility
  var componentDir = Vue.internalDirectives.component

  // shim the component directive
  var set = componentDir.setComponent
  componentDir.setComponent = function (id, cb) {
    var prevComponent = this.Component
    var prevId = prevComponent && prevComponent.options.hotID
    if (prevId) {
      map[prevId].instances.$remove(this)
    }
    set.call(this, id, cb)
  }

  var resolve = componentDir.resolveComponent
  componentDir.resolveComponent = function (id, cb) {
    var view = this
    resolve.call(this, id, function () {
      var Component = view.Component
      var newId = Component.options.hotID
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

  var unbind = componentDir.unbind
  componentDir.unbind = function () {
    var id = this.Component && this.Component.options.hotID
    if (id) {
      map[id].instances.$remove(this)
    }
    unbind.call(this)
  }

  console.log('[HMR] Vue component hot reload shim applied.')
}

/**
 * Update a component directive instance
 *
 * @param {Directive} view
 */

exports.update = function (view) {
  if (!view._bound) {
    return
  }
  // disable transitions
  view.vm._isCompiled = false
  // save state
  var state = view.childVM.$data
  // remount, make sure to disable keep-alive
  var keepAlive = view.keepAlive
  view.keepAlive = false
  view.mountComponent()
  view.keepAlive = keepAlive
  // restore state
  view.childVM.$data = state
  // re-eanble transitions
  view.vm._isCompiled = true
}
