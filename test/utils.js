const Vue = require('vue')
const path = require('path')
const hash = require('hash-sum')
const { JSDOM, VirtualConsole } = require('jsdom')
const webpack = require('webpack')
const merge = require('webpack-merge')
const { createFsFromVolume, Volume } = require('memfs')

const mfs = createFsFromVolume(new Volume())
const VueLoaderPlugin = require('../lib/plugin')

const baseConfig = {
  mode: 'development',
  devtool: false,
  output: {
    path: '/',
    publicPath: '',
    filename: 'test.build.js'
  },
  resolveLoader: {
    alias: {
      'vue-loader': require.resolve('../lib')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  // https://github.com/webpack/webpack/issues/10542
  optimization: {
    usedExports: false
  }
}

function genId (file) {
  return hash(path.join('test', 'fixtures', file).replace(/\\/g, '/'))
}

function bundle (options, cb, wontThrowError) {
  let config = merge({}, baseConfig, options)

  if (config.vue) {
    const vueOptions = options.vue
    delete config.vue
    const vueIndex = config.module.rules.findIndex(r => r.test.test('.vue'))
    const vueRule = config.module.rules[vueIndex]
    config.module.rules[vueIndex] = Object.assign({}, vueRule, { options: vueOptions })
  }

  if (/\.vue/.test(config.entry)) {
    const vueFile = config.entry
    config = merge(config, {
      entry: require.resolve('./fixtures/entry'),
      resolve: {
        alias: {
          '~target': path.resolve(__dirname, './fixtures', vueFile)
        }
      }
    })
  }

  if (options.modify) {
    delete config.modify
    options.modify(config)
  }

  const webpackCompiler = webpack(config)
  webpackCompiler.outputFileSystem = mfs
  webpackCompiler.outputFileSystem.join = path.join.bind(path)
  webpackCompiler.run((err, stats) => {
    if (!wontThrowError) {
      expect(err).toBeNull()

      if (stats.hasErrors()) {
        return console.error(stats.toString('errors-only'))
      }
      expect(stats.hasErrors()).toBeFalsy()
    }
    cb(mfs.readFileSync('/test.build.js').toString(), stats, err)
  })
}

function mockBundleAndRun (options, assert, wontThrowError) {
  const { suppressJSDOMConsole } = options
  delete options.suppressJSDOMConsole
  bundle(options, (code, bundleStats, bundleError) => {
    let dom, jsdomError
    try {
      dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
        runScripts: 'outside-only',
        virtualConsole: suppressJSDOMConsole ? new VirtualConsole() : null
      })
      dom.window.eval(code)
    } catch (e) {
      console.error(`JSDOM error:\n${e.stack}`)
      jsdomError = e
    }

    const { window } = dom
    const { module, exports } = window
    const instance = {}
    if (module && module.beforeCreate) {
      module.beforeCreate.forEach(hook => hook.call(instance))
    }
    assert({
      window,
      module,
      exports,
      instance,
      code,
      jsdomError,
      bundleStats,
      bundleError
    })
  }, wontThrowError)
}

function mockRender (options, data = {}) {
  const vm = new Vue(Object.assign({}, options, { data () { return data } }))
  vm.$mount()
  return vm._vnode
}

function interopDefault (module) {
  return module
    ? module.default ? module.default : module
    : module
}

function initStylesForAllSubComponents (module) {
  if (module.components) {
    for (const name in module.components) {
      const sub = module.components[name]
      const instance = {}
      if (sub && sub.beforeCreate) {
        sub.beforeCreate.forEach(hook => hook.call(instance))
      }
      initStylesForAllSubComponents(sub)
    }
  }
}

module.exports = {
  mfs,
  baseConfig,
  genId,
  bundle,
  mockBundleAndRun,
  mockRender,
  interopDefault,
  initStylesForAllSubComponents
}
