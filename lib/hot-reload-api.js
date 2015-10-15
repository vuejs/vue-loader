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
  // shim component
  shimComponent(Vue.internalDirectives.component, map)
  console.log('[HMR] vue component hot reload shim applied.')
  // shim router-view if present
  var routerView = Vue.elementDirective('router-view')
  if (routerView) {
    shimComponent(routerView, map)
    console.log('[HMR] vue-router <router-view> hot reload shim applied.')
  }
}

/**
 * Shim the component directive.
 *
 * @param {Object} dir
 * @param {Object} map - hot component map
 */

function shimComponent (dir, map) {
  shimMethod(dir, 'unbuild', function (defer) {
    var prevComponent = this.childVM && this.childVM.constructor
    removeComponent(prevComponent, map, this)
    // defer = true means we are transitioning to a new
    // Component. Register this new component to the list.
    if (defer) {
      addComponent(this.Component, map, this)
    }
  })
}

/**
 * Shim a directive method.
 *
 * @param {Object} dir
 * @param {String} methodName
 * @param {Function} fn
 */

function shimMethod (dir, methodName, fn) {
  var original = dir[methodName]
  dir[methodName] = function () {
    fn.apply(this, arguments)
    return original.apply(this, arguments)
  }
}

/**
 * Remove a component view from a Component's hot list
 *
 * @param {Function} Component
 * @param {Object} map - hot component map
 * @param {Directive} view - view directive instance
 */

function removeComponent (Component, map, view) {
  var id = Component && Component.options.hotID
  if (id) {
    map[id].instances.$remove(view)
  }
}

/**
 * Add a component view to a Component's hot list
 *
 * @param {Function} Component
 * @param {Object} map - hot component map
 * @param {Directive} view - view directive instance
 */

function addComponent (Component, map, view) {
  var id = Component && Component.options.hotID
  if (id) {
    if (!map[id]) {
      map[id] = {
        Ctor: Component,
        instances: []
      }
    }
    map[id].instances.push(view)
  }
}

/**
 * Update a component view instance
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
