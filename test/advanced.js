process.env.VUE_LOADER_TEST = true

const path = require('path')
const { expect } = require('chai')
const {
  mfs,
  loaderPath,
  bundle,
  mockBundleAndRun,
  mockRender
} = require('./shared')

const normalizeNewline = require('normalize-newline')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const SourceMapConsumer = require('source-map').SourceMapConsumer

describe('advanced features', () => {
  it('pre/post loaders', done => {
    mockBundleAndRun({
      entry: 'basic.vue',
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

  it('support chaining with other loaders', done => {
    const mockLoaderPath = require.resolve('./mock-loaders/js')
    mockBundleAndRun({
      entry: 'basic.vue',
      modify: config => {
        config.module.rules[0].loader = loaderPath + '!' + mockLoaderPath
      }
    }, (window, module) => {
      expect(module.data().msg).to.equal('Changed!')
      done()
    })
  })

  it('expose filename', done => {
    mockBundleAndRun({
      entry: 'basic.vue'
    }, (window, module, rawModule) => {
      expect(module.__file).to.equal(path.normalize('test/fixtures/basic.vue'))
      done()
    })
  })

  it('extract CSS', done => {
    bundle({
      entry: 'extract-css.vue',
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
      entry: 'extract-css.vue',
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
      entry: 'extract-css.vue',
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

  it('pre-processors with extract css', done => {
    mockBundleAndRun({
      entry: 'pre.vue',
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

  it('source map', done => {
    bundle({
      entry: 'basic.vue',
      devtool: '#source-map'
    }, (code, warnings) => {
      const map = mfs.readFileSync('/test.build.js.map', 'utf-8')
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

  it('multiple rule definitions', done => {
    mockBundleAndRun({
      modify: config => {
        // remove default rule
        config.module.rules.shift()
      },
      entry: './test/fixtures/multiple-rules.js',
      module: {
        rules: [
          {
            test: /\.vue$/,
            oneOf: [
              {
                include: /-1\.vue$/,
                loader: loaderPath,
                options: {
                  postcss: [
                    css => {
                      css.walkDecls('font-size', decl => {
                        decl.value = `${parseInt(decl.value, 10) * 2}px`
                      })
                    }
                  ],
                  compilerModules: [{
                    postTransformNode: el => {
                      el.staticClass = '"multiple-rule-1"'
                    }
                  }]
                }
              },
              {
                include: /-2\.vue$/,
                loader: loaderPath,
                options: {
                  postcss: [
                    css => {
                      css.walkDecls('font-size', decl => {
                        decl.value = `${parseInt(decl.value, 10) / 2}px`
                      })
                    }
                  ],
                  compilerModules: [{
                    postTransformNode: el => {
                      el.staticClass = '"multiple-rule-2"'
                    }
                  }]
                }
              }
            ]
          }
        ]
      }
    }, (window, module) => {
      const vnode1 = mockRender(window.rules[0])
      const vnode2 = mockRender(window.rules[1])
      expect(vnode1.data.staticClass).to.equal('multiple-rule-1')
      expect(vnode2.data.staticClass).to.equal('multiple-rule-2')
      const styles = window.document.querySelectorAll('style')
      const expr = /\.multiple-rule-\d\s*\{\s*font-size:\s*([.0-9]+)px;/
      for (let i = 0, l = styles.length; i < l; i++) {
        const content = styles[i].textContent
        if (expr.test(content)) {
          expect(parseFloat(RegExp.$1)).to.be.equal(14)
        }
      }
      done()
    })
  })

  it('thread mode', done => {
    mockBundleAndRun({
      entry: 'basic.vue',
      vue: {
        threadMode: true
      }
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
})
