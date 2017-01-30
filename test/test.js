process.env.VUE_LOADER_TEST = true

var path = require('path')
var jsdom = require('jsdom')
var webpack = require('webpack')
var MemoryFS = require('memory-fs')
var expect = require('chai').expect
var genId = require('../lib/gen-id')
var compiler = require('../lib/template-compiler')
var normalizeNewline = require('normalize-newline')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var SourceMapConsumer = require('source-map').SourceMapConsumer

var loaderPath = 'expose-loader?vueModule!' + path.resolve(__dirname, '../index.js')
var mfs = new MemoryFS()
var globalConfig = {
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
  }
}

function bundle (options, cb) {
  var vueOptions = options.vue
  delete options.vue
  var config = Object.assign({}, globalConfig, options)

  // assign vue Options
  if (vueOptions) {
    config.plugins = (config.plugins || []).concat(new webpack.LoaderOptionsPlugin({
      vue: vueOptions
    }))
  }

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
    cb(mfs.readFileSync('/test.build.js').toString(), stats.compilation.warnings)
  })
}

function test (options, assert) {
  bundle(options, function (code, warnings) {
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
    _v (val) {
      return val
    },
    _self: {},
    $createElement (tag, data, children) {
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
      style = normalizeNewline(style)
      expect(style).to.contain('comp-a h2 {\n  color: #f00;\n}')
      done()
    })
  })

  it('expose filename', function (done) {
    test({
      entry: './test/fixtures/basic.vue'
    }, function (window, module, rawModule) {
      expect(module.__file).to.equal(path.resolve(__dirname, './fixtures/basic.vue'))
      done()
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
      style = normalizeNewline(style)
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
    bundle({
      entry: './test/fixtures/basic.vue',
      devtool: '#source-map'
    }, function (code, warnings) {
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
      style = normalizeNewline(style)
      var id = 'data-v-' + genId(require.resolve('./fixtures/media-query.vue'))
      expect(style).to.contain('@media print {\n.foo[' + id + '] {\n    color: #000;\n}\n}')
      done()
    })
  })

  it('extract CSS', function (done) {
    bundle({
      entry: './test/fixtures/extract-css.vue',
      vue: {
        loaders: {
          css: ExtractTextPlugin.extract('css-loader'),
          stylus: ExtractTextPlugin.extract('css-loader?sourceMap!stylus-loader')
        }
      },
      plugins: [
        new ExtractTextPlugin('test.output.css')
      ]
    }, function (code, warnings) {
      var css = mfs.readFileSync('/test.output.css').toString()
      css = normalizeNewline(css)
      expect(css).to.contain('h1 {\n  color: #f00;\n}\n\nh2 {\n  color: green;\n}')
      done()
    })
  })

  it('dependency injection', function (done) {
    test({
      entry: './test/fixtures/inject.js'
    }, function (window) {
      // console.log(window.injector.toString())
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
        rules: [
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

  it('transformToRequire option', function (done) {
    test({
      entry: './test/fixtures/transform.vue',
      module: {
        rules: [
          { test: /\.vue$/, loader: loaderPath },
          {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader'
          }
        ]
      }
    }, function (window, module) {
      function includeDataURL (s) {
        return !!s.match(/\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*/i)
      }
      var vnode = mockRender(module)
      // img tag
      expect(includeDataURL(vnode.children[0].data.attrs.src)).to.equal(true)
      // image tag (SVG)
      expect(includeDataURL(vnode.children[2].children[0].data.attrs['xlink:href'])).to.equal(true)
      var style = window.document.querySelector('style').textContent
      // style
      expect(includeDataURL(style)).to.equal(true)
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
      style = normalizeNewline(style)
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

  it('css-modules', function (done) {
    function testWithIdent (localIdentName, regexToMatch, cb) {
      test({
        entry: './test/fixtures/css-modules.vue',
        vue: {
          cssModules: localIdentName && {
            localIdentName: localIdentName
          }
        }
      }, function (window) {
        var module = window.vueModule

        // get local class name
        var className = module.computed.style().red
        expect(className).to.match(regexToMatch)

        // class name in style
        var style = [].slice.call(window.document.querySelectorAll('style')).map(function (style) {
          return style.textContent
        }).join('\n')
        style = normalizeNewline(style)
        expect(style).to.contain('.' + className + ' {\n  color: red;\n}')

        // animation name
        var match = style.match(/@keyframes\s+(\S+)\s+{/)
        expect(match).to.have.length(2)
        var animationName = match[1]
        expect(animationName).to.not.equal('fade')
        expect(style).to.contain('animation: ' + animationName + ' 1s;')

        // default module + pre-processor + scoped
        var anotherClassName = module.computed.$style().red
        expect(anotherClassName).to.match(regexToMatch).and.not.equal(className)
        var id = 'data-v-' + genId(require.resolve('./fixtures/css-modules.vue'))
        expect(style).to.contain('.' + anotherClassName + '[' + id + ']')

        cb()
      })
    }
    // default localIdentName
    testWithIdent(undefined, /^\w{23}/, function () {
      // specified localIdentName
      var ident = '[path][name]---[local]---[hash:base64:5]'
      var regex = /^test-fixtures-css-modules---red---\w{5}/
      testWithIdent(ident, regex, done)
    })
  })

  it('css-modules in SSR', function (done) {
    bundle({
      entry: './test/fixtures/css-modules.vue',
      target: 'node',
      output: Object.assign({}, globalConfig.output, {
        libraryTarget: 'commonjs2'
      })
    }, function (code, warnings) {
      // http://stackoverflow.com/questions/17581830/load-node-js-module-from-string-in-memory
      function requireFromString(src, filename) {
        var Module = module.constructor;
        var m = new Module();
        m._compile(src, filename);
        return m.exports;
      }

      var output = requireFromString(code, './test.build.js')
      expect(output.computed.style().red).to.exist

      done()
    })
  })

  it('support chaining with other loaders', done => {
    const mockLoaderPath = require.resolve('./mock-loader')
    test({
      entry: './test/fixtures/basic.vue',
      module: {
        rules: [
          { test: /\.vue$/, loader: loaderPath + '!' + mockLoaderPath }
        ]
      }
    }, function (window, module) {
      expect(module.data().msg).to.equal('Changed!')
      done()
    })
  })

  it('extract custom blocks to a separate file', function (done) {
    bundle({
      entry: './test/fixtures/custom-language.vue',
      vue: {
        loaders: {
          'documentation': ExtractTextPlugin.extract('raw-loader')
        }
      },
      plugins: [
        new ExtractTextPlugin('doc.md')
      ]
    }, function (code, warnings) {
      var unitTest = mfs.readFileSync('/doc.md').toString()
      unitTest = normalizeNewline(unitTest)
      expect(unitTest).to.contain('This is example documentation for a component.')
      done()
    })
  })

  it('add custom blocks to the webpack output', function (done) {
    bundle({
      entry: './test/fixtures/custom-language.vue',
      vue: {
        loaders: {
          'unit-test': 'babel-loader'
        }
      }
    }, function (code, warnings) {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('custom blocks work with src imports', function (done) {
    bundle({
      entry: './test/fixtures/custom-import.vue',
      vue: {
        loaders: {
          'unit-test': 'babel-loader'
        }
      }
    }, function (code, warnings) {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('custom blocks can be removed from the output', function (done) {
    bundle({
      entry: './test/fixtures/custom-language.vue',
      vue: {
        loaders: {
          'unit-test': 'null-loader'
        }
      }
    }, function (code, warnings) {
      expect(code).not.to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('no warnings when loaders are specified for all custom blocks', function (done) {
    bundle({
      entry: './test/fixtures/custom-language.vue',
      vue: {
        loaders: {
          'documentation': 'null-loader',
          'unit-test': 'null-loader'
        }
      }
    }, function (code, warnings) {
      expect(warnings.length).to.equal(0)
      done()
    })
  })

  it('warning should be raised when a loader is not specified for a custom block', function (done) {
    bundle({
      entry: './test/fixtures/custom-language.vue',
      vue: {
        loaders: {
          'documentation': 'null-loader'
        }
      }
    }, function (code, warnings) {
      expect(warnings.length).to.equal(1)
      expect(warnings[0].message).to.equal('Loader for custom block type "unit-test" not found in webpack configuration')
      done()
    })
  })

  it('passes attributes as options to the loader', function (done) {
    bundle({
      entry: './test/fixtures/custom-options.vue',
      vue: {
        loaders: {
          'unit-test': 'babel-loader!skeleton-loader'
        }
      },
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            skeletonLoader: {
              procedure: function(content, sourceMap, callback, options) {
                expect(options.foo).to.equal('bar');
                expect(options.opt2).to.equal('value2');

                // Return the content to output.
                return content;
              }
            }
          }
        })
      ]
    }, function (code, warnings) {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })
})
