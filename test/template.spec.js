const path = require('path')
const normalizeNewline = require('normalize-newline')
const {
  mockRender,
  mockBundleAndRun
} = require('./utils')

test('template with comments', done => {
  mockBundleAndRun({
    entry: 'template-comment.vue'
  }, ({ window, module }) => {
    expect(module.comments).toBe(true)
    const vnode = mockRender(module, {
      msg: 'hi'
    })
    expect(vnode.tag).toBe('div')
    expect(vnode.children.length).toBe(2)
    expect(vnode.children[0].data.staticClass).toBe('red')
    expect(vnode.children[0].children[0].text).toBe('hi')
    expect(vnode.children[1].isComment).toBe(true)
    expect(vnode.children[1].text).toBe(' comment here ')
    done()
  })
})

test('transpile ES2015 features in template', done => {
  mockBundleAndRun({
    entry: 'es2015.vue'
  }, ({ window, module }) => {
    const vnode = mockRender(module, {
      a: 'hello',
      b: true
    })
    // <div :class="{[a]:true}"></div>
    expect(vnode.tag).toBe('div')
    expect(vnode.data.class['test-hello']).toBe(true)
    expect(vnode.data.class['b']).toBe(true)
    done()
  })
})

test('transform relative URLs and respects resolve alias', done => {
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
  }, ({ window, module }) => {
    const vnode = mockRender(module)
    // <div>
    //   <img src="logo.c9e00e.png">
    //   <img src="logo.c9e00e.png">
    // </div>
    expect(vnode.children[0].tag).toBe('img')
    expect(vnode.children[0].data.attrs.src).toBe('logo.c9e00e.png')
    expect(vnode.children[2].tag).toBe('img')
    expect(vnode.children[2].data.attrs.src).toBe('logo.c9e00e.png')

    const style = window.document.querySelector('style').textContent
    expect(style).toContain('html { background-image: url(logo.c9e00e.png);\n}')
    expect(style).toContain('body { background-image: url(logo.c9e00e.png);\n}')
    done()
  })
})

test('transform srcset', done => {
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
  }, ({ window, module }) => {
    function includeDataURL (s) {
      return !!s.match(/\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*/i)
    }
    const vnode = mockRender(module)
    // img tag
    expect(includeDataURL(vnode.children[0].data.attrs.src)).toBe(true)
    // image tag (SVG)
    expect(includeDataURL(vnode.children[2].children[0].data.attrs['xlink:href'])).toBe(true)
    const style = window.document.querySelector('style').textContent

    const dataURL = vnode.children[0].data.attrs.src

    // image tag with srcset
    expect(vnode.children[4].data.attrs.srcset).toBe(dataURL)
    expect(vnode.children[6].data.attrs.srcset).toBe(dataURL + ' 2x')
    // image tag with multiline srcset
    expect(vnode.children[8].data.attrs.srcset).toBe(dataURL + ', ' + dataURL + ' 2x')
    expect(vnode.children[10].data.attrs.srcset).toBe(dataURL + ' 2x, ' + dataURL)
    expect(vnode.children[12].data.attrs.srcset).toBe(dataURL + ' 2x, ' + dataURL + ' 3x')
    expect(vnode.children[14].data.attrs.srcset).toBe(dataURL + ', ' + dataURL + ' 2x, ' + dataURL + ' 3x')
    expect(vnode.children[16].data.attrs.srcset).toBe(dataURL + ' 2x, ' + dataURL + ' 3x')

    // style
    expect(includeDataURL(style)).toBe(true)
    done()
  })
})

test('functional component with styles', done => {
  mockBundleAndRun({
    entry: 'functional-style.vue'
  }, ({ window, module }) => {
    expect(module.functional).toBe(true)
    const vnode = mockRender(module)
    // <div class="foo">hi</div>
    expect(vnode.tag).toBe('div')
    expect(vnode.data.class).toBe('foo')
    expect(vnode.children[0].text).toBe('functional')

    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    expect(style).toContain('.foo { color: red;\n}')
    done()
  })
})

test('functional template', done => {
  mockBundleAndRun({
    entry: 'functional-root.vue',
    vue: {
      compilerOptions: {
        preserveWhitespace: false
      }
    }
  }, ({ window, module }) => {
    expect(module.components.Functional._compiled).toBe(true)
    expect(module.components.Functional.functional).toBe(true)
    expect(module.components.Functional.staticRenderFns).toBeDefined()
    expect(typeof module.components.Functional.render).toBe('function')

    const vnode = mockRender(module, {
      fn () {
        done()
      }
    }).children[0]

    // Basic vnode
    expect(vnode.children[0].data.staticClass).toBe('red')
    expect(vnode.children[0].children[0].text).toBe('hello')
    // Default slot vnode
    expect(vnode.children[1].tag).toBe('span')
    expect(vnode.children[1].children[0].text).toBe('hello')
    // Named slot vnode
    expect(vnode.children[2].tag).toBe('div')
    expect(vnode.children[2].children[0].text).toBe('Second slot')
    // // Scoped slot vnode
    expect(vnode.children[3].text).toBe('hello')
    // // Static content vnode
    expect(vnode.children[4].tag).toBe('div')
    expect(vnode.children[4].children[0].text).toBe('Some ')
    expect(vnode.children[4].children[1].tag).toBe('span')
    expect(vnode.children[4].children[1].children[0].text).toBe('text')
    // // v-if vnode
    expect(vnode.children[5].text).toBe('')

    vnode.children[6].data.on.click()
  })
})

test('customizing template loaders', done => {
  mockBundleAndRun({
    entry: 'markdown.vue',
    module: {
      rules: [
        {
          test: /\.md$/,
          loader: 'markdown-loader'
        }
      ]
    }
  }, ({ window, module }) => {
    const vnode = mockRender(module, {
      msg: 'hi'
    })
    // <h2 id="-msg-">{{msg}}</h2>
    expect(vnode.tag).toBe('h2')
    expect(vnode.data.attrs.id).toBe('-msg-')
    expect(vnode.children[0].text).toBe('hi')
    done()
  })
})

test('custom compiler modules', done => {
  mockBundleAndRun({
    entry: 'custom-module.vue',
    vue: {
      compilerOptions: {
        modules: [
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
    }
  }, ({ window, module }) => {
    const results = []
    // var vnode =
    mockRender(
      Object.assign(module, { methods: { $processStyle: style => results.push(style) }}),
      { transform: 'translateX(10px)' }
    )
    expect(results).toEqual([
      { 'flex-direction': 'row' },
      { 'transform': 'translateX(10px)' }
    ])
    done()
  })
})

test('custom compiler directives', done => {
  mockBundleAndRun({
    entry: 'custom-directive.vue',
    vue: {
      compilerOptions: {
        directives: {
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
    }
  }, ({ window, module }) => {
    const vnode = mockRender(module)
    expect(vnode.data.domProps.textContent).toBe('keypath')
    done()
  })
})

test('separate loader configuration for template lang and js imports', done => {
  mockBundleAndRun({
    entry: './test/fixtures/template-pre.js',
    module: {
      rules: [
        {
          test: /\.pug$/,
          oneOf: [
            // this applies to <template lang="pug"> in Vue components
            {
              resourceQuery: /^\?vue/,
              use: ['pug-plain-loader']
            },
            // this applies to pug imports inside JavaScript
            {
              use: ['raw-loader', 'pug-plain-loader']
            }
          ]
        }
      ]
    }
  }, ({ exports }) => {
    function assertRender (vnode) {
      expect(vnode.tag).toBe('div')
      expect(vnode.children[0].tag).toBe('h1')
      expect(vnode.children[0].children[0].text).toBe('hello')
    }

    // <template lang="pug">
    const vnode1 = mockRender(exports.Comp1, {})
    assertRender(vnode1)
    // <template lang="pug" src="./foo.pug">
    const vnode2 = mockRender(exports.Comp2, {})
    assertRender(vnode2)
    // import html from './foo.pug'
    expect(exports.html).toBe('<div><h1>hello</h1></div>')
    done()
  })
})
