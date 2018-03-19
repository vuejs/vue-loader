const path = require('path')
const jsdom = require('jsdom')
const webpack = require('webpack')
const merge = require('webpack-merge')
const MemoryFS = require('memory-fs')
const { expect } = require('chai')
const hash = require('hash-sum')
const Vue = require('vue')

const mfs = new MemoryFS()
const loaderPath = path.resolve(__dirname, '../index.js')
const globalConfig = {
  // mode: 'development',
  devtool: false,
  output: {
    path: '/',
    filename: 'test.build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: loaderPath
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
}

function genId (file) {
  return hash(path.join('test', 'fixtures', file))
}

function bundle (options, cb, wontThrowError) {
  let config = merge({}, globalConfig, options)

  if (config.vue) {
    const vueOptions = options.vue
    delete config.vue
    const vueIndex = config.module.rules.findIndex(r => r.test.test('.vue'))
    const vueRule = config.module.rules[vueIndex]
    config.module.rules[vueIndex] = Object.assign({}, vueRule, { options: vueOptions })
  }

  if (/\.vue$/.test(config.entry)) {
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
  webpackCompiler.run((err, stats) => {
    const errors = stats.compilation.errors
    if (!wontThrowError) {
      expect(err).to.be.null
      if (errors && errors.length) {
        errors.forEach(error => {
          console.error(error.message)
        })
      }
      expect(errors).to.be.empty
    }
    cb(mfs.readFileSync('/test.build.js').toString(), stats, err)
  })
}

function mockBundleAndRun (options, assert, wontThrowError) {
  bundle(options, (code, stats, err) => {
    jsdom.env({
      html: '<!DOCTYPE html><html><head></head><body></body></html>',
      src: [code],
      done: (errors, window) => {
        if (errors) {
          console.log(errors[0].data.error.stack)
          if (!wontThrowError) {
            expect(errors).to.be.null
          }
        }
        const module = interopDefault(window.vueModule)
        const instance = {}
        if (module && module.beforeCreate) {
          module.beforeCreate.forEach(hook => hook.call(instance))
        }
        assert(window, module, window.vueModule, instance, errors, { stats, err })
      }
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
  loaderPath,
  globalConfig,
  genId,
  bundle,
  mockBundleAndRun,
  mockRender,
  interopDefault,
  initStylesForAllSubComponents
}
