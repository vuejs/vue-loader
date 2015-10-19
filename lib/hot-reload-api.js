var Vue // late bind
var map = Object.create(null)
var shimmed = false

/**
 * Determine compatibility and apply patch.
 *
 * @param {Function} vue
 */

exports.install = function (vue) {
  if (shimmed) return
  shimmed = true

  Vue = vue
  exports.compatible = !!Vue.internalDirectives
  if (!exports.compatible) {
    console.warn(
      '[HMR] vue-loader hot reload is only compatible with ' +
      'Vue.js 1.0.0+.'
    )
    return
  }

  // patch view directive
  patchView(Vue.internalDirectives.component)
  console.log('[HMR] vue component hot reload shim applied.')
  // shim router-view if present
  var routerView = Vue.elementDirective('router-view')
  if (routerView) {
    patchView(routerView)
    console.log('[HMR] vue-router <router-view> hot reload shim applied.')
  }
}

/**
 * Shim the view directive (component or router-view).
 *
 * @param {Object} View
 */

function patchView (View) {
  var unbuild = View.unbuild
  View.unbuild = function (defer) {
    if (!this.hotUpdating) {
      var prevComponent = this.childVM && this.childVM.constructor
      removeComponent(prevComponent, this)
      // defer = true means we are transitioning to a new
      // Component. Register this new component to the list.
      if (defer) {
        addComponent(this.Component, this)
      }
    }
    // call original
    return unbuild.call(this, defer)
  }
}

/**
 * Add a component view to a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function addComponent (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    if (!map[id]) {
      map[id] = {
        Component: Component,
        views: [],
        instances: []
      }
    }
    map[id].views.push(view)
  }
}

/**
 * Remove a component view from a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function removeComponent (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    map[id].views.$remove(view)
  }
}

/**
 * Create a record for a hot module, which keeps track of its construcotr,
 * instnaces and views (component directives or router-views).
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if (typeof options.el !== 'string' && typeof options.data !== 'object') {
    var add = function () {
      map[id].instances.push(this)
    }
    var remove = function () {
      map[id].instances.$remove(this)
    }
    options.created = options.created
      ? [options.created, add]
      : add
    options.beforeDestroy = options.beforeDestroy
      ? [options.beforeDestroy, remove]
      : remove
    map[id] = {
      Component: Vue.extend(options),
      views: [],
      instances: []
    }
  }
}

/**
 * Update a hot component.
 *
 * @param {String} id
 * @param {Object|null} newOptions
 * @param {String|null} newTemplate
 */

exports.update = function (id, newOptions, newTemplate) {
  var record = map[id]
  // force full-reload if an instance of the component is active but is not
  // managed by a view
  if (!record || (record.instances.length && !record.views.length)) {
    throw new Error('Root or manually-mounted instance modified. Full reload is required.')
  }
  var Component = record.Component
  // update constructor
  if (newOptions) {
    Component.options = Vue.util.mergeOptions(Vue.options, newOptions)
  }
  if (newTemplate) {
    Component.options.template = newTemplate
  }
  // handle recursive lookup
  if (Component.options.name) {
    console.log(Component.options)
    Component.options.components[Component.options.name] = Component
  }
  // reset constructor cached linker
  Component.linker = null
  // reload all views
  record.views.forEach(updateView)
}

/**
 * Update a component view instance
 *
 * @param {Directive} view
 */

function updateView (view) {
  if (!view._bound) {
    return
  }
  view.hotUpdating = true
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
  view.hotUpdating = false
}
