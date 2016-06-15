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
var compiler = require('vue-template-compiler')

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
        assert(window)
      }
    })
  })
}

function assertRenderFn (options, template) {
  var compiled = compiler.compile(template)
  expect(options.render.toString()).to.equal('function (){' + compiled.render + '}')
}

describe('vue-loader', function () {
  it('basic', function (done) {
    test({
      entry: './test/fixtures/basic.vue'
    }, function (window) {
      var module = window.vueModule
      assertRenderFn(module, '<h2 class="red">{{msg}}</h2>')
      expect(module.data().msg).to.contain('Hello from Component A!')
      var style = window.document.querySelector('style').textContent
      expect(style).to.contain('comp-a h2 {\n  color: #f00;\n}')
      done()
    })
  })

  it('pre-processors', function (done) {
    test({
      entry: './test/fixtures/pre.vue'
    }, function (window) {
      var module = window.vueModule
      assertRenderFn(module,
        '<div>' +
          '<h1>This is the app</h1>' +
          '<comp-a></comp-a>' +
          '<comp-b></comp-b>' +
        '</div>'
      )
      expect(module.data().msg).to.contain('Hello from coffee!')
      var style = window.document.querySelector('style').textContent
      expect(style).to.contain('body {\n  font: 100% Helvetica, sans-serif;\n  color: #999;\n}')
      done()
    })
  })

  it('scoped style', function (done) {
    test({
      entry: './test/fixtures/scoped-css.vue'
    }, function (window) {
      var module = window.vueModule
      var id = 'data-v-' + genId(require.resolve('./fixtures/scoped-css.vue'))
      expect(module._scopeId).to.equal(id)
      assertRenderFn(module,
        '<div>' +
          '<div><h1>hi</h1></div>\n' +
          '<p class="abc def">hi</p>\n' +
          '<template v-if="ok"><p class="test">yo</p></template>\n' +
          '<svg><template><p></p></template></svg>' +
        '</div>'
      )
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
      expect(styles[0].textContent).to.contain('h1 { color: red; }')
      // import with scoped
      var id = 'data-v-' + genId(require.resolve('./fixtures/style-import.vue'))
      expect(styles[1].textContent).to.contain('h1[' + id + '] { color: green; }')
      done()
    })
  })

  it('template import', function (done) {
    test({
      entry: './test/fixtures/template-import.vue'
    }, function (window) {
      var module = window.vueModule
      assertRenderFn(module, '<div><h1>hello</h1></div>')
      done()
    })
  })

  it('script import', function (done) {
    test({
      entry: './test/fixtures/script-import.vue'
    }, function (window) {
      var module = window.vueModule
      expect(module.data().msg).to.contain('Hello from Component A!')
      done()
    })
  })

  it('source map', function (done) {
    var config = Object.assign({}, globalConfig, {
      entry: './test/fixtures/basic.vue',
      devtool: 'source-map'
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
          col = l.length
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
      expect(style).to.contain('@media print {\n  .foo[' + id + '] {\n    color: #000;\n  }\n}')
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
      expect(css).to.contain('h1 {\n  color: #f00;\n}\n\n\n\n\n\n\nh2 {\n  color: green;\n}')
      done()
    })
  })

  it('dependency injection', function (done) {
    test({
      entry: './test/fixtures/inject.js'
    }, function (window) {
      var module = window.injector({
        './service': {
          msg: 'Hello from mocked service!'
        }
      })
      assertRenderFn(module, '<div class="msg">{{ msg }}</div>')
      expect(module.data().msg).to.contain('Hello from mocked service!')
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
    }, function (window) {
      var module = window.vueModule
      assertRenderFn(module, '<img src="logo.c9e00e.png">\n<img src="logo.c9e00e.png">')
      var style = window.document.querySelector('style').textContent
      expect(style).to.contain('html { background-image: url(logo.c9e00e.png); }')
      expect(style).to.contain('body { background-image: url(logo.c9e00e.png); }')
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
})
