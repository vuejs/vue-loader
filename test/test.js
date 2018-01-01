process.env.VUE_LOADER_TEST = true

const fs = require('fs')
const path = require('path')
const jsdom = require('jsdom')
const webpack = require('webpack')
const MemoryFS = require('memory-fs')
const expect = require('chai').expect
const hash = require('hash-sum')
const Vue = require('vue')
const SSR = require('vue-server-renderer')
// var compiler = require('../lib/template-compiler')
const normalizeNewline = require('normalize-newline')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const SourceMapConsumer = require('source-map').SourceMapConsumer

const rawLoaderPath = path.resolve(__dirname, '../index.js')
const loaderPath = 'expose-loader?vueModule!' + rawLoaderPath
const mfs = new MemoryFS()
const globalConfig = {
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
  const vueOptions = options.vue
  delete options.vue
  const config = Object.assign({}, globalConfig, options)

  // assign vue Options
  if (vueOptions) {
    config.plugins = (config.plugins || []).concat(new webpack.LoaderOptionsPlugin({
      vue: vueOptions
    }))
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

function test (options, assert, wontThrowError) {
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
    ? module.__esModule ? module.default : module
    : module
}

describe('vue-loader', () => {
  it('basic', done => {
    test({
      entry: './test/fixtures/basic.vue'
    }, (window, module, rawModule) => {
      const vnode = mockRender(module, {
        msg: 'hi'
      })

      // <h2 class="red">{{msg}}</h2>
      expect(vnode.tag).to.equal('h2')
      expect(vnode.data.staticClass).to.equal('red')
      expect(vnode.children[0].text).to.equal('hi')

      expect(module.data().msg).to.contain('Hello from Component A!')
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('comp-a h2 {\n  color: #f00;\n}')
      done()
    })
  })

  it('expose filename', done => {
    test({
      entry: './test/fixtures/basic.vue'
    }, (window, module, rawModule) => {
      expect(module.__file).to.equal(path.normalize('test/fixtures/basic.vue'))
      done()
    })
  })

  it('pre-processors', done => {
    test({
      entry: './test/fixtures/pre.vue'
    }, (window, module) => {
      const vnode = mockRender(module)
      // div
      //   h1 This is the app
      //   comp-a
      //   comp-b
      expect(vnode.children[0].tag).to.equal('h1')
      expect(vnode.children[1].tag).to.equal('comp-a')
      expect(vnode.children[2].tag).to.equal('comp-b')

      expect(module.data().msg).to.contain('Hello from coffee!')
      const style = window.document.querySelector('style').textContent
      expect(style).to.contain('body {\n  font: 100% Helvetica, sans-serif;\n  color: #999;\n}')
      done()
    })
  })

  it('pre-processors with extract css', done => {
    test({
      entry: './test/fixtures/pre.vue',
      vue: {
        extractCSS: true
      },
      plugins: [
        new ExtractTextPlugin('test.output.css')
      ]
    }, (window, module) => {
      const vnode = mockRender(module)

      expect(vnode.children[0].tag).to.equal('h1')
      expect(vnode.children[1].tag).to.equal('comp-a')
      expect(vnode.children[2].tag).to.equal('comp-b')

      expect(module.data().msg).to.contain('Hello from coffee!')

      let css = mfs.readFileSync('/test.output.css').toString()
      css = normalizeNewline(css)
      expect(css).to.contain('body {\n  font: 100% Helvetica, sans-serif;\n  color: #999;\n}')

      done()
    })
  })

  it('scoped style', done => {
    test({
      entry: './test/fixtures/scoped-css.vue'
    }, (window, module) => {
      const id = 'data-v-' + genId('scoped-css.vue')
      expect(module._scopeId).to.equal(id)

      const vnode = mockRender(module, {
        ok: true
      })
      // <div>
      //   <div><h1>hi</h1></div>
      //   <p class="abc def">hi</p>
      //   <template v-if="ok"><p class="test">yo</p></template>
      //   <svg><template><p></p></template></svg>
      // </div>
      expect(vnode.children[0].tag).to.equal('div')
      expect(vnode.children[1].text).to.equal(' ')
      expect(vnode.children[2].tag).to.equal('p')
      expect(vnode.children[2].data.staticClass).to.equal('abc def')
      expect(vnode.children[4].tag).to.equal('p')
      expect(vnode.children[4].data.staticClass).to.equal('test')

      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain(`.test[${id}] {\n  color: yellow;\n}`)
      expect(style).to.contain(`.test[${id}]:after {\n  content: \'bye!\';\n}`)
      expect(style).to.contain(`h1[${id}] {\n  color: green;\n}`)
      // scoped keyframes
      expect(style).to.contain(`.anim[${id}] {\n  animation: color-${id} 5s infinite, other 5s;`)
      expect(style).to.contain(`.anim-2[${id}] {\n  animation-name: color-${id}`)
      expect(style).to.contain(`.anim-3[${id}] {\n  animation: 5s color-${id} infinite, 5s other;`)
      expect(style).to.contain(`@keyframes color-${id} {`)
      expect(style).to.contain(`@-webkit-keyframes color-${id} {`)

      expect(style).to.contain(`.anim-multiple[${id}] {\n  animation: color-${id} 5s infinite,opacity-${id} 2s;`)
      expect(style).to.contain(`.anim-multiple-2[${id}] {\n  animation-name: color-${id},opacity-${id};`)
      expect(style).to.contain(`@keyframes opacity-${id} {`)
      expect(style).to.contain(`@-webkit-keyframes opacity-${id} {`)
      // >>> combinator
      expect(style).to.contain(`.foo p[${id}] .bar {\n  color: red;\n}`)
      done()
    })
  })

  it('style import', done => {
    test({
      entry: './test/fixtures/style-import.vue'
    }, (window) => {
      const styles = window.document.querySelectorAll('style')
      expect(styles[0].textContent).to.contain('h1 { color: red;\n}')
      // import with scoped
      const id = 'data-v-' + genId('style-import.vue')
      expect(styles[1].textContent).to.contain('h1[' + id + '] { color: green;\n}')
      done()
    })
  })

  it('template import', done => {
    test({
      entry: './test/fixtures/template-import.vue'
    }, (window, module) => {
      const vnode = mockRender(module)
      // '<div><h1>hello</h1></div>'
      expect(vnode.children[0].tag).to.equal('h1')
      expect(vnode.children[0].children[0].text).to.equal('hello')
      done()
    })
  })

  it('script import', done => {
    test({
      entry: './test/fixtures/script-import.vue'
    }, (window, module) => {
      expect(module.data().msg).to.contain('Hello from Component A!')
      done()
    })
  })

  it('source map', done => {
    bundle({
      entry: './test/fixtures/basic.vue',
      devtool: '#source-map'
    }, (code, warnings) => {
      const map = mfs.readFileSync('/test.build.js.map').toString()
      const smc = new SourceMapConsumer(JSON.parse(map))
      let line
      let col
      const targetRE = /^\s+msg: 'Hello from Component A!'/
      code.split(/\r?\n/g).some((l, i) => {
        if (targetRE.test(l)) {
          line = i + 1
          col = 0
          return true
        }
      })
      const pos = smc.originalPositionFor({
        line: line,
        column: col
      })
      expect(pos.source.indexOf('basic.vue') > -1)
      expect(pos.line).to.equal(9)
      done()
    })
  })

  it('media-query', done => {
    test({
      entry: './test/fixtures/media-query.vue'
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      const id = 'data-v-' + genId('media-query.vue')
      expect(style).to.contain('@media print {\n.foo[' + id + '] {\n    color: #000;\n}\n}')
      done()
    })
  })

  it('supports-query', done => {
    test({
      entry: './test/fixtures/supports-query.vue'
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      const id = 'data-v-' + genId('supports-query.vue')
      expect(style).to.contain('@supports ( color: #000 ) {\n.foo[' + id + '] {\n    color: #000;\n}\n}')
      done()
    })
  })

  it('extract CSS', done => {
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
    }, (code, warnings) => {
      let css = mfs.readFileSync('/test.output.css').toString()
      css = normalizeNewline(css)
      expect(css).to.contain('h1 {\n  color: #f00;\n}')
      expect(css).to.contain('h2 {\n  color: green;\n}')
      done()
    })
  })

  it('extract CSS using option', done => {
    bundle({
      entry: './test/fixtures/extract-css.vue',
      vue: {
        extractCSS: true
      },
      plugins: [
        new ExtractTextPlugin('test.output.css')
      ]
    }, (code, warnings) => {
      let css = mfs.readFileSync('/test.output.css').toString()
      css = normalizeNewline(css)
      expect(css).to.contain('h1 {\n  color: #f00;\n}')
      expect(css).to.contain('h2 {\n  color: green;\n}')
      done()
    })
  })

  it('extract CSS using option (passing plugin instance)', done => {
    const plugin = new ExtractTextPlugin('test.output.css')
    bundle({
      entry: './test/fixtures/extract-css.vue',
      vue: {
        extractCSS: plugin
      },
      plugins: [
        plugin
      ]
    }, (code, warnings) => {
      let css = mfs.readFileSync('/test.output.css').toString()
      css = normalizeNewline(css)
      expect(css).to.contain('h1 {\n  color: #f00;\n}')
      expect(css).to.contain('h2 {\n  color: green;\n}')
      done()
    })
  })

  it('dependency injection', done => {
    test({
      entry: './test/fixtures/inject.js'
    }, (window) => {
      // console.log(window.injector.toString())
      const module = interopDefault(window.injector({
        './service': {
          msg: 'Hello from mocked service!'
        }
      }))
      const vnode = mockRender(module, module.data())
      // <div class="msg">{{ msg }}</div>
      expect(vnode.tag).to.equal('div')
      expect(vnode.data.staticClass).to.equal('msg')
      expect(vnode.children[0].text).to.equal('Hello from mocked service!')
      done()
    })
  })

  it('translates relative URLs and respects resolve alias', done => {
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
    }, (window, module) => {
      const vnode = mockRender(module)
      // <div>
      //   <img src="logo.c9e00e.png">
      //   <img src="logo.c9e00e.png">
      // </div>
      expect(vnode.children[0].tag).to.equal('img')
      expect(vnode.children[0].data.attrs.src).to.equal('logo.c9e00e.png')
      expect(vnode.children[2].tag).to.equal('img')
      expect(vnode.children[2].data.attrs.src).to.equal('logo.c9e00e.png')

      const style = window.document.querySelector('style').textContent
      expect(style).to.contain('html { background-image: url(logo.c9e00e.png);\n}')
      expect(style).to.contain('body { background-image: url(logo.c9e00e.png);\n}')
      done()
    })
  })

  it('transformToRequire option', done => {
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
    }, (window, module) => {
      function includeDataURL (s) {
        return !!s.match(/\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*/i)
      }
      const vnode = mockRender(module)
      // img tag
      expect(includeDataURL(vnode.children[0].data.attrs.src)).to.equal(true)
      // image tag (SVG)
      expect(includeDataURL(vnode.children[2].children[0].data.attrs['xlink:href'])).to.equal(true)
      const style = window.document.querySelector('style').textContent

      const dataURL = vnode.children[0].data.attrs.src

      // image tag with srcset
      expect(vnode.children[4].data.attrs.srcset).to.equal(dataURL)
      expect(vnode.children[6].data.attrs.srcset).to.equal(dataURL + ' 2x')
      // image tag with multiline srcset
      expect(vnode.children[8].data.attrs.srcset).to.equal(dataURL + ', ' + dataURL + ' 2x')
      expect(vnode.children[10].data.attrs.srcset).to.equal(dataURL + ' 2x, ' + dataURL)
      expect(vnode.children[12].data.attrs.srcset).to.equal(dataURL + ' 2x, ' + dataURL + ' 3x')
      expect(vnode.children[14].data.attrs.srcset).to.equal(dataURL + ', ' + dataURL + ' 2x, ' + dataURL + ' 3x')
      expect(vnode.children[16].data.attrs.srcset).to.equal(dataURL + ' 2x, ' + dataURL + ' 3x')

      // style
      expect(includeDataURL(style)).to.equal(true)
      done()
    })
  })

  it('postcss options', done => {
    test({
      entry: './test/fixtures/postcss.vue',
      vue: {
        postcss: {
          options: {
            parser: require('sugarss')
          }
        }
      }
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('h1 {\n  color: red;\n  font-size: 14px\n}')
      done()
    })
  })

  it('load postcss config file', done => {
    fs.writeFileSync('.postcssrc', JSON.stringify({ parser: 'sugarss' }))
    test({
      entry: './test/fixtures/postcss.vue'
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('h1 {\n  color: red;\n  font-size: 14px\n}')
      fs.unlinkSync('.postcssrc')
      done()
    })
  })

  it('load postcss config file by path', done => {
    fs.writeFileSync('test/.postcssrc', JSON.stringify({ parser: 'sugarss' }))
    test({
      entry: './test/fixtures/postcss.vue',
      vue: {
        postcss: {
          config: {
            path: path.resolve('test')
          }
        }
      }
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('h1 {\n  color: red;\n  font-size: 14px\n}')
      fs.unlinkSync('test/.postcssrc')
      done()
    })
  })

  it('load postcss config file with js syntax error', done => {
    fs.writeFileSync('.postcssrc.js', 'module.exports = { hello }')
    test({
      entry: './test/fixtures/basic.vue'
    }, (window, module, vueModule, instance, jsdomErr, webpackInfo) => {
      const { stats: { compilation: { warnings, errors }}, err } = webpackInfo
      expect(jsdomErr).to.be.null
      expect(err).to.be.null
      expect(warnings).to.be.empty
      expect(errors.length).to.equal(1)
      expect(errors[0].message).match(/^Error loading PostCSS config\:/)
      fs.unlinkSync('.postcssrc.js')
      done()
    }, true)
  })

  it('postcss lang', done => {
    test({
      entry: './test/fixtures/postcss-lang.vue'
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('h1 {\n  color: red;\n  font-size: 14px\n}')
      done()
    })
  })

  it('transpile ES2015 features in template', done => {
    test({
      entry: './test/fixtures/es2015.vue'
    }, (window, module) => {
      const vnode = mockRender(module, {
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

  it('allows to export extended constructor', done => {
    test({
      entry: './test/fixtures/extend.vue'
    }, (window, Module) => {
      // extend.vue should export Vue constructor
      const vnode = mockRender(Module.options, {
        msg: 'success'
      })
      expect(vnode.tag).to.equal('div')
      expect(vnode.children[0].text).to.equal('success')
      expect(new Module().msg === 'success')
      done()
    })
  })

  it('support es compatible modules', done => {
    test({
      entry: './test/fixtures/basic.vue',
      vue: {
        esModule: true
      }
    }, (window, module, rawModule) => {
      expect(rawModule.__esModule).to.equal(true)
      const vnode = mockRender(rawModule.default, {
        msg: 'hi'
      })
      expect(vnode.tag).to.equal('h2')
      expect(vnode.data.staticClass).to.equal('red')
      expect(vnode.children[0].text).to.equal('hi')

      expect(rawModule.default.data().msg).to.contain('Hello from Component A!')
      done()
    })
  })

  it('css-modules', done => {
    function testWithIdent (localIdentName, regexToMatch, cb) {
      test({
        entry: './test/fixtures/css-modules.vue',
        vue: {
          cssModules: localIdentName && {
            localIdentName: localIdentName
          }
        }
      }, (window, module, raw, instance) => {
        // get local class name
        const className = instance.style.red
        expect(className).to.match(regexToMatch)

        // class name in style
        let style = [].slice.call(window.document.querySelectorAll('style')).map((style) => {
          return style.textContent
        }).join('\n')
        style = normalizeNewline(style)
        expect(style).to.contain('.' + className + ' {\n  color: red;\n}')

        // animation name
        const match = style.match(/@keyframes\s+(\S+)\s+{/)
        expect(match).to.have.length(2)
        const animationName = match[1]
        expect(animationName).to.not.equal('fade')
        expect(style).to.contain('animation: ' + animationName + ' 1s;')

        // default module + pre-processor + scoped
        const anotherClassName = instance.$style.red
        expect(anotherClassName).to.match(regexToMatch).and.not.equal(className)
        const id = 'data-v-' + genId('css-modules.vue')
        expect(style).to.contain('.' + anotherClassName + '[' + id + ']')

        cb()
      })
    }
    // default localIdentName
    testWithIdent(undefined, /^\w{23}/, () => {
      // specified localIdentName
      const ident = '[path][name]---[local]---[hash:base64:5]'
      const regex = /^test-fixtures-css-modules---red---\w{5}/
      testWithIdent(ident, regex, done)
    })
  })

  it('css-modules in SSR', done => {
    bundle({
      entry: './test/fixtures/css-modules.vue',
      target: 'node',
      output: Object.assign({}, globalConfig.output, {
        libraryTarget: 'commonjs2'
      })
    }, (code, warnings) => {
      // http://stackoverflow.com/questions/17581830/load-node-js-module-from-string-in-memory
      function requireFromString (src, filename) {
        const Module = module.constructor
        const m = new Module()
        m._compile(src, filename)
        return m.exports
      }

      const output = interopDefault(requireFromString(code, './test.build.js'))
      const mockInstance = {}

      output.beforeCreate.forEach(hook => hook.call(mockInstance))
      expect(mockInstance.style.red).to.exist

      done()
    })
  })

  it('should allow adding custom html loaders', done => {
    test({
      entry: './test/fixtures/markdown.vue',
      vue: {
        loaders: {
          html: 'marked'
        }
      }
    }, (window, module) => {
      const vnode = mockRender(module, {
        msg: 'hi'
      })
      // <h2 id="-msg-">{{msg}}</h2>
      expect(vnode.tag).to.equal('h2')
      expect(vnode.data.attrs.id).to.equal('-msg-')
      expect(vnode.children[0].text).to.equal('hi')
      done()
    })
  })

  it('support chaining with other loaders', done => {
    const mockLoaderPath = require.resolve('./mock-loaders/js')
    test({
      entry: './test/fixtures/basic.vue',
      module: {
        rules: [
          { test: /\.vue$/, loader: loaderPath + '!' + mockLoaderPath }
        ]
      }
    }, (window, module) => {
      expect(module.data().msg).to.equal('Changed!')
      done()
    })
  })

  it('SSR style and moduleId extraction', done => {
    bundle({
      target: 'node',
      entry: './test/fixtures/ssr-style.js',
      output: {
        path: '/',
        filename: 'test.build.js',
        libraryTarget: 'commonjs2'
      },
      externals: ['vue'],
      module: {
        rules: [{ test: /\.vue$/, loader: rawLoaderPath }]
      }
    }, code => {
      const renderer = SSR.createBundleRenderer(code, {
        basedir: __dirname,
        runInNewContext: 'once'
      })
      const context = {
        _registeredComponents: new Set()
      }
      renderer.renderToString(context, (err, res) => {
        if (err) return done(err)
        expect(res).to.contain('data-server-rendered')
        expect(res).to.contain('<h1>Hello</h1>')
        expect(res).to.contain('Hello from Component A!')
        expect(res).to.contain('<div class="foo">functional</div>')
        // from main component
        expect(context.styles).to.contain('h1 { color: green;')
        // from imported child component
        expect(context.styles).to.contain('comp-a h2 {\n  color: #f00;')
        // from imported css file
        expect(context.styles).to.contain('h1 { color: red;')
        // from imported functional component
        expect(context.styles).to.contain('.foo { color: red;')
        // collect component identifiers during render
        expect(Array.from(context._registeredComponents).length).to.equal(3)
        done()
      })
    })
  })

  it('extract custom blocks to a separate file', done => {
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
    }, (code, warnings) => {
      let unitTest = mfs.readFileSync('/doc.md').toString()
      unitTest = normalizeNewline(unitTest)
      expect(unitTest).to.contain('This is example documentation for a component.')
      done()
    })
  })

  it('add custom blocks to the webpack output', done => {
    bundle({
      entry: './test/fixtures/custom-language.vue',
      vue: {
        loaders: {
          'unit-test': 'babel-loader'
        }
      }
    }, (code, warnings) => {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('custom blocks work with src imports', done => {
    bundle({
      entry: './test/fixtures/custom-import.vue',
      vue: {
        loaders: {
          'unit-test': 'babel-loader'
        }
      }
    }, (code, warnings) => {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('passes Component to custom block loaders', done => {
    const mockLoaderPath = require.resolve('./mock-loaders/docs')
    test({
      entry: './test/fixtures/custom-language.vue',
      vue: {
        loaders: {
          'documentation': mockLoaderPath
        }
      }
    }, (window, module) => {
      expect(module.__docs).to.contain('This is example documentation for a component.')
      done()
    })
  })

  it('custom blocks can be ignored', done => {
    bundle({
      entry: './test/fixtures/custom-language.vue'
    }, (code, warnings) => {
      expect(code).not.to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('custom blocks with ES module default export', done => {
    test({
      entry: './test/fixtures/custom-blocks.vue',
      vue: {
        loaders: {
          esm: require.resolve('./mock-loaders/identity')
        }
      }
    }, (window, module) => {
      // option added by custom block code
      expect(module.foo).to.equal(1)
      done()
    })
  })

  it('passes attributes as options to the loader', done => {
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
              procedure: (content, sourceMap, callback, options) => {
                expect(options.foo).to.equal('bar')
                expect(options.opt2).to.equal('value2')

                // Return the content to output.
                return content
              }
            }
          }
        })
      ]
    }, (code, warnings) => {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('pre/post loaders', done => {
    test({
      entry: './test/fixtures/basic.vue',
      vue: {
        preLoaders: {
          js: require.resolve('./mock-loaders/js'),
          css: require.resolve('./mock-loaders/css')
        },
        postLoaders: {
          html: require.resolve('./mock-loaders/html')
        }
      }
    }, (window, module) => {
      const vnode = mockRender(module, {
        msg: 'hi'
      })
      // <h2 class="green">{{msg}}</h2>
      expect(vnode.tag).to.equal('h2')
      expect(vnode.data.staticClass).to.equal('green')
      expect(vnode.children[0].text).to.equal('hi')

      expect(module.data().msg).to.contain('Changed!')
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('comp-a h2 {\n  color: #00f;\n}')
      done()
    })
  })

  it('pre/post loaders for custom blocks', done => {
    test({
      entry: './test/fixtures/custom-blocks.vue',
      vue: {
        preLoaders: {
          i18n: require.resolve('./mock-loaders/yaml')
        },
        loaders: {
          i18n: require.resolve('./mock-loaders/i18n'),
          blog: 'marked'
        },
        postLoaders: {
          blog: require.resolve('./mock-loaders/blog')
        }
      }
    }, (window, module) => {
      const vnode = mockRender(module, {
        msg: JSON.parse(module.__i18n).en.hello,
        blog: module.__blog
      })
      expect(vnode.children[0].children[0].text).to.equal('hello world')
      expect(vnode.children[2].data.domProps.innerHTML).to.equal('<h2 id="foo">foo</h2>')
      done()
    })
  })

  it('custom compiler modules', done => {
    test({
      entry: './test/fixtures/custom-module.vue',
      vue: {
        compilerModules: [
          {
            postTransformNode: el => {
              if (el.staticStyle) {
                el.staticStyle = `$processStyle(${el.staticStyle})`
              }
              if (el.styleBinding) {
                el.styleBinding = `$processStyle(${el.styleBinding})`
              }
            }
          }
        ]
      }
    }, (window, module) => {
      const results = []
      // var vnode =
      mockRender(
        Object.assign(module, { methods: { $processStyle: style => results.push(style) }}),
        { transform: 'translateX(10px)' }
      )
      expect(results).to.deep.equal([
        { 'flex-direction': 'row' },
        { 'transform': 'translateX(10px)' }
      ])
      done()
    })
  })

  it('custom compiler modules (string)', done => {
    test({
      entry: './test/fixtures/basic.vue',
      vue: {
        compilerModules: require.resolve('./fixtures/custom-module')
      }
    }, (window, module) => {
      const vnode = mockRender(module, {
        msg: 'hi'
      })
      expect(vnode.data.staticClass).to.equal('red blue')
      done()
    })
  })

  it('custom compiler directives', done => {
    test({
      entry: './test/fixtures/custom-directive.vue',
      vue: {
        compilerDirectives: {
          i18n (el, dir) {
            if (dir.name === 'i18n' && dir.value) {
              el.i18n = dir.value
              if (!el.props) {
                el.props = []
              }
              el.props.push({ name: 'textContent', value: `_s(${JSON.stringify(dir.value)})` })
            }
          }
        }
      }
    }, (window, module) => {
      const vnode = mockRender(module)
      expect(vnode.data.domProps.textContent).to.equal('keypath')
      done()
    })
  })

  it('functional component with styles', done => {
    test({
      entry: './test/fixtures/functional-style.vue'
    }, (window, module, rawModule) => {
      expect(module.functional).to.equal(true)
      const vnode = mockRender(module)
      // <div class="foo">hi</div>
      expect(vnode.tag).to.equal('div')
      expect(vnode.data.class).to.equal('foo')
      expect(vnode.children[0].text).to.equal('functional')

      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('.foo { color: red;\n}')
      done()
    })
  })

  it('template with comments', done => {
    test({
      entry: './test/fixtures/template-comment.vue'
    }, (window, module, rawModule) => {
      expect(module.comments).to.equal(true)
      const vnode = mockRender(module, {
        msg: 'hi'
      })
      expect(vnode.tag).to.equal('div')
      expect(vnode.children.length).to.equal(2)
      expect(vnode.children[0].data.staticClass).to.equal('red')
      expect(vnode.children[0].children[0].text).to.equal('hi')
      expect(vnode.children[1].isComment).to.true
      expect(vnode.children[1].text).to.equal(' comment here ')
      done()
    })
  })

  it('functional template', done => {
    test({
      entry: './test/fixtures/functional-root.vue',
      vue: {
        preserveWhitespace: false
      }
    }, (window, module) => {
      expect(module.components.Functional._compiled).to.equal(true)
      expect(module.components.Functional.functional).to.equal(true)
      expect(module.components.Functional.staticRenderFns).to.exist
      expect(module.components.Functional.render).to.be.a('function')

      const vnode = mockRender(module, {
        fn () {
          done()
        }
      }).children[0]

      // Basic vnode
      expect(vnode.children[0].data.staticClass).to.equal('red')
      expect(vnode.children[0].children[0].text).to.equal('hello')
      // Default slot vnode
      expect(vnode.children[1].tag).to.equal('span')
      expect(vnode.children[1].children[0].text).to.equal('hello')
      // Named slot vnode
      expect(vnode.children[2].tag).to.equal('div')
      expect(vnode.children[2].children[0].text).to.equal('Second slot')
      // // Scoped slot vnode
      expect(vnode.children[3].text).to.equal('hello')
      // // Static content vnode
      expect(vnode.children[4].tag).to.equal('div')
      expect(vnode.children[4].children[0].text).to.equal('Some ')
      expect(vnode.children[4].children[1].tag).to.equal('span')
      expect(vnode.children[4].children[1].children[0].text).to.equal('text')
      // // v-if vnode
      expect(vnode.children[5].text).to.equal('')

      vnode.children[6].data.on.click()
    })
  })

  it('hot reload enabled', done => {
    bundle({
      entry: './test/fixtures/basic.vue',
      vue: {
        hotReload: true
      }
    }, (code) => {
      expect(code).to.contains('require("vue-hot-reload-api")')
      done()
    })
  })

  it('hot reload disabled', done => {
    bundle({
      entry: './test/fixtures/basic.vue',
      vue: {
        hotReload: false
      }
    }, (code) => {
      expect(code).not.to.contains('require("vue-hot-reload-api")')
      done()
    })
  })

  it('named exports', done => {
    test({
      entry: './test/fixtures/named-exports.vue'
    }, (window, _, rawModule) => {
      expect(rawModule.default.name).to.equal('named-exports')
      expect(rawModule.foo()).to.equal(1)
      done()
    })
  })
})
