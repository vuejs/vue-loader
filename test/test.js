process.env.VUE_LOADER_TEST = true

var path = require('path')
var webpack = require('webpack')
var MemoryFS = require('memory-fs')
var jsdom = require('jsdom')
var expect = require('chai').expect
var rimraf = require('rimraf')
var genId = require('../lib/gen-id')
var SourceMapConsumer = require('source-map').SourceMapConsumer
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var compiler = require('../lib/template-compiler')

var loaderPath = 'expose?vueModule!' + path.resolve(__dirname, '../')
var mfs = new MemoryFS()
var globalConfig = {
  output: {
    path: '/',
    filename: 'test.build.js'
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: loaderPath
      }
    ]
  }
}

function bundle (options, cb) {
  var config = Object.assign({}, globalConfig, options)
  var webpackCompiler = webpack(config)
  webpackCompiler.outputFileSystem = mfs
  webpackCompiler.run(function (err, stats) {
    expect(err).to.be.null
    if (stats.compilation.errors.length) {
      stats.compilation.errors.forEach(function (err) {
        console.error(err.message)
      })
    }
    expect(stats.compilation.errors).to.be.empty
    cb(mfs.readFileSync('/test.build.js').toString())
  })
}

function test (options, assert) {
  bundle(options, function (code) {
    jsdom.env({
      html: '<!DOCTYPE html><html><head></head><body></body></html>',
      src: [code],
      done: function (err, window) {
        if (err) {
          console.log(err[0].data.error.stack)
          expect(err).to.be.null
        }
        assert(window, interopDefault(window.vueModule), window.vueModule)
      }
    })
  })
}

function mockRender (options, data) {
  return options.render.call(Object.assign({
    _h (tag, data, children) {
      if (Array.isArray(data)) {
        children = data
        data = null
      }
      return {
        tag: tag,
        data: data,
        children: children
      }
    },
    _m (index) {
      return options.staticRenderFns[index].call(this)
    },
    _s (str) {
      return String(str)
    }
  }, data))
}

function interopDefault (module) {
  return module
    ? module.__esModule ? module.default : module
    : module
}

describe('vue-loader', function () {
  it('basic', function (done) {
    test({
      entry: './test/fixtures/basic.vue'
    }, function (window, module, rawModule) {
      var vnode = mockRender(module, {
        msg: 'hi'
      })
      // <h2 class="red">{{msg}}</h2>
      expect(vnode.tag).to.equal('h2')
      expect(vnode.data.staticClass).to.equal('red')
      expect(vnode.children[0]).to.equal('hi')

      expect(module.data().msg).to.contain('Hello from Component A!')
      var style = window.document.querySelector('style').textContent
      expect(style).to.contain('comp-a h2 {\n  color: #f00;\n}')
      done()
    })
  })

  it('automatic name setting based on filename', function (done) {
    test({
      entry: './test/fixtures/unnamed.vue'
    }, function (window, module, rawModule) {
      expect(module.name).to.equal('unnamed')
      test({
        entry: './test/fixtures/named.vue'
      }, function (window, module, rawModule) {
        expect(module.name).to.equal('custom-name')
        test({
          entry: './test/fixtures/unnamed-5tr@ng3_f1l3n@me$.vue'
        }, function (window, module, rawModule) {
          expect(module.name).to.equal('unnamed-5trng3f1l3nme')
          done()
        })
      })
    })
  })

  it('pre-processors', function (done) {
    test({
      entry: './test/fixtures/pre.vue'
    }, function (window, module) {
      var vnode = mockRender(module)
      // div
      //   h1 This is the app
      //   comp-a
      //   comp-b
      expect(vnode.children[0].tag).to.equal('h1')
      expect(vnode.children[1].tag).to.equal('comp-a')
      expect(vnode.children[2].tag).to.equal('comp-b')

      expect(module.data().msg).to.contain('Hello from coffee!')
      var style = window.document.querySelector('style').textContent
      expect(style).to.contain('body {\n  font: 100% Helvetica, sans-serif;\n  color: #999;\n}')
      done()
    })
  })

  it('scoped style', function (done) {
    test({
      entry: './test/fixtures/scoped-css.vue'
    }, function (window, module) {
      var id = 'data-v-' + genId(require.resolve('./fixtures/scoped-css.vue'))
      expect(module._scopeId).to.equal(id)

      var vnode = mockRender(module, {
        ok: true
      })
      // <div>
      //   <div><h1>hi</h1></div>
      //   <p class="abc def">hi</p>
      //   <template v-if="ok"><p class="test">yo</p></template>
      //   <svg><template><p></p></template></svg>
      // </div>
      expect(vnode.children[0].tag).to.equal('div')
      expect(vnode.children[1]).to.equal(' ')
      expect(vnode.children[2].tag).to.equal('p')
      expect(vnode.children[2].data.staticClass).to.equal('abc def')
      expect(vnode.children[4][0].tag).to.equal('p')
      expect(vnode.children[4][0].data.staticClass).to.equal('test')

      var style = window.document.querySelector('style').textContent
      expect(style).to.contain('.test[' + id + '] {\n  color: yellow;\n}')
      expect(style).to.contain('.test[' + id + ']:after {\n  content: \'bye!\';\n}')
      expect(style).to.contain('h1[' + id + '] {\n  color: green;\n}')
      done()
    })
  })

  it('style import', function (done) {
    test({
      entry: './test/fixtures/style-import.vue'
    }, function (window) {
      var styles = window.document.querySelectorAll('style')
      expect(styles[0].textContent).to.contain('h1 { color: red;\n}')
      // import with scoped
      var id = 'data-v-' + genId(require.resolve('./fixtures/style-import.vue'))
      expect(styles[1].textContent).to.contain('h1[' + id + '] { color: green;\n}')
      done()
    })
  })

  it('template import', function (done) {
    test({
      entry: './test/fixtures/template-import.vue'
    }, function (window, module) {
      var vnode = mockRender(module)
      // '<div><h1>hello</h1></div>'
      expect(vnode.children[0].tag).to.equal('h1')
      expect(vnode.children[0].children[0]).to.equal('hello')
      done()
    })
  })

  it('script import', function (done) {
    test({
      entry: './test/fixtures/script-import.vue'
    }, function (window, module) {
      expect(module.data().msg).to.contain('Hello from Component A!')
      done()
    })
  })

  it('source map', function (done) {
    var config = Object.assign({}, globalConfig, {
      entry: './test/fixtures/basic.vue',
      devtool: '#source-map'
    })
    bundle(config, function (code) {
      var map = mfs.readFileSync('/test.build.js.map').toString()
      var smc = new SourceMapConsumer(JSON.parse(map))
      var line
      var col
      var targetRE = /^\s+msg: 'Hello from Component A!'/
      code.split(/\r?\n/g).some(function (l, i) {
        if (targetRE.test(l)) {
          line = i + 1
          col = 0
          return true
        }
      })
      var pos = smc.originalPositionFor({
        line: line,
        column: col
      })
      expect(pos.source.indexOf('basic.vue') > -1)
      expect(pos.line).to.equal(9)
      done()
    })
  })

  it('media-query', function (done) {
    test({
      entry: './test/fixtures/media-query.vue'
    }, function (window) {
      var style = window.document.querySelector('style').textContent
      var id = 'data-v-' + genId(require.resolve('./fixtures/media-query.vue'))
      expect(style).to.contain('@media print {\n.foo[' + id + '] {\n    color: #000;\n}\n}')
      done()
    })
  })

  it('extract CSS', function (done) {
    bundle(Object.assign({}, globalConfig, {
      entry: './test/fixtures/extract-css.vue',
      vue: {
        loaders: {
          css: ExtractTextPlugin.extract('css'),
          stylus: ExtractTextPlugin.extract('css?sourceMap!stylus')
        }
      },
      plugins: [
        new ExtractTextPlugin('test.output.css')
      ]
    }), function () {
      var css = mfs.readFileSync('/test.output.css').toString()
      expect(css).to.contain('h1 {\n  color: #f00;\n}\n\nh2 {\n  color: green;\n}')
      done()
    })
  })

  it('dependency injection', function (done) {
    test({
      entry: './test/fixtures/inject.js'
    }, function (window) {
      var module = interopDefault(window.injector({
        './service': {
          msg: 'Hello from mocked service!'
        }
      }))
      var vnode = mockRender(module, module.data())
      // <div class="msg">{{ msg }}</div>
      expect(vnode.tag).to.equal('div')
      expect(vnode.data.staticClass).to.equal('msg')
      expect(vnode.children[0]).to.equal('Hello from mocked service!')
      done()
    })
  })

  it('translates relative URLs and respects resolve alias', function (done) {
    test({
      entry: './test/fixtures/resolve.vue',
      resolve: {
        alias: {
          fixtures: path.resolve(__dirname, 'fixtures')
        }
      },
      module: {
        loaders: [
          { test: /\.vue$/, loader: loaderPath },
          { test: /\.png$/, loader: 'file-loader?name=[name].[hash:6].[ext]' }
        ]
      }
    }, function (window, module) {
      var vnode = mockRender(module)
      // <div>
      //   <img src="logo.c9e00e.png">
      //   <img src="logo.c9e00e.png">
      // </div>
      expect(vnode.children[0].tag).to.equal('img')
      expect(vnode.children[0].data.attrs.src).to.equal('logo.c9e00e.png')
      expect(vnode.children[2].tag).to.equal('img')
      expect(vnode.children[2].data.attrs.src).to.equal('logo.c9e00e.png')

      var style = window.document.querySelector('style').textContent
      expect(style).to.contain('html { background-image: url(logo.c9e00e.png);\n}')
      expect(style).to.contain('body { background-image: url(logo.c9e00e.png);\n}')
      done()
    })
  })

  it('postcss options', function (done) {
    test({
      entry: './test/fixtures/postcss.vue',
      vue: {
        postcss: {
          options: {
            parser: require('sugarss')
          }
        }
      }
    }, function (window) {
      var style = window.document.querySelector('style').textContent
      expect(style).to.contain('h1 {\n  color: red;\n  font-size: 14px\n}')
      done()
    })
  })

  it('transpile ES2015 features in template', function (done) {
    test({
      entry: './test/fixtures/es2015.vue'
    }, function (window, module) {
      var vnode = mockRender(module, {
        a: 'hello',
        b: true
      })
      // <div :class="{[a]:true}"></div>
      expect(vnode.tag).to.equal('div')
      expect(vnode.data.class['test-hello']).to.equal(true)
      expect(vnode.data.class['b']).to.equal(true)
      done()
    })
  })

  it('allows to export extended constructor', function (done) {
    test({
      entry: './test/fixtures/extend.vue'
    }, function (window, Module) {
      // extend.vue should export Vue constructor
      var vnode = mockRender(Module.options, {
        msg: 'success'
      })
      expect(vnode.tag).to.equal('div')
      expect(vnode.children[0]).to.equal('success')
      expect(new Module().msg === 'success')
      done()
    })
  })

  it('support es compatible modules', function (done) {
    test({
      entry: './test/fixtures/basic.vue',
      vue: {
        esModule: true
      }
    }, function (window, module, rawModule) {
      expect(rawModule.__esModule).to.equal(true)
      var vnode = mockRender(rawModule.default, {
        msg: 'hi'
      })
      expect(vnode.tag).to.equal('h2')
      expect(vnode.data.staticClass).to.equal('red')
      expect(vnode.children[0]).to.equal('hi')

      expect(rawModule.default.data().msg).to.contain('Hello from Component A!')
      done()
    })
  })
})
