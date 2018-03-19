process.env.VUE_LOADER_TEST = true

const path = require('path')
const { expect } = require('chai')
const {
  mockBundleAndRun,
  mockRender
} = require('./shared')

const normalizeNewline = require('normalize-newline')

describe('template block features', () => {
  it('template with comments', done => {
    mockBundleAndRun({
      entry: 'template-comment.vue'
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

  it('transpile ES2015 features in template', done => {
    mockBundleAndRun({
      entry: 'es2015.vue'
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

  it('translates relative URLs and respects resolve alias', done => {
    mockBundleAndRun({
      entry: 'resolve.vue',
      resolve: {
        alias: {
          fixtures: path.resolve(__dirname, './fixtures')
        }
      },
      module: {
        rules: [
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
    mockBundleAndRun({
      entry: 'transform.vue',
      module: {
        rules: [
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

  it('should allow adding custom html loaders', done => {
    mockBundleAndRun({
      entry: 'markdown.vue',
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

  it('custom compiler modules', done => {
    mockBundleAndRun({
      entry: 'custom-module.vue',
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

  it('custom compiler directives', done => {
    mockBundleAndRun({
      entry: 'custom-directive.vue',
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
    mockBundleAndRun({
      entry: 'functional-style.vue'
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

  it('functional template', done => {
    mockBundleAndRun({
      entry: 'functional-root.vue',
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
})
