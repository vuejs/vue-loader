const {
  genId,
  mockRender,
  mockBundleAndRun,
  initStylesForAllSubComponents
} = require('./utils')

const normalizeNewline = require('normalize-newline')

test('basic', done => {
  mockBundleAndRun({
    entry: 'basic.vue'
  }, ({ window, module }) => {
    const vnode = mockRender(module, {
      msg: 'hi'
    })

    // <h2 class="red">{{msg}}</h2>
    expect(vnode.tag).toBe('h2')
    expect(vnode.data.staticClass).toBe('red')
    expect(vnode.children[0].text).toBe('hi')

    expect(module.data().msg).toContain('Hello from Component A!')
    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    expect(style).toContain('comp-a h2 {\n  color: #f00;\n}')
    done()
  })
})

test('pre-processors', done => {
  mockBundleAndRun({
    entry: 'pre.vue',
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader'
        },
        {
          test: /\.pug$/,
          loader: 'pug-plain-loader'
        },
        {
          test: /\.stylus$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'stylus-loader'
          ]
        }
      ]
    }
  }, ({ window, module, code }) => {
    // make sure babel is actually applied
    expect(code).toMatch('data: function data()')

    const vnode = mockRender(module)
    // div
    //   h1 This is the app
    //   comp-a
    //   comp-b
    expect(vnode.children[0].tag).toBe('h1')
    expect(vnode.children[1].tag).toBe('comp-a')
    expect(vnode.children[2].tag).toBe('comp-b')

    // script
    expect(module.data().msg).toContain('Hello from Babel')

    // style
    const style = window.document.querySelector('style').textContent
    expect(style).toContain('body {\n  font: 100% Helvetica, sans-serif;\n  color: #999;\n}')
    done()
  })
})

test('style import', done => {
  mockBundleAndRun({
    entry: 'style-import.vue'
  }, ({ window }) => {
    const styles = window.document.querySelectorAll('style')
    expect(styles[0].textContent).toContain('h1 { color: red;\n}')
    // import with scoped
    const id = 'data-v-' + genId('style-import.vue')
    expect(styles[1].textContent).toContain('h1[' + id + '] { color: green;\n}')
    done()
  })
})

test('style import for a same file twice', done => {
  mockBundleAndRun({
    entry: 'style-import-twice.vue'
  }, ({ window, module }) => {
    initStylesForAllSubComponents(module)
    const styles = window.document.querySelectorAll('style')
    expect(styles.length).toBe(3)
    expect(styles[0].textContent).toContain('h1 { color: red;\n}')
    // import with scoped
    const id = 'data-v-' + genId('style-import-twice-sub.vue')
    expect(styles[1].textContent).toContain('h1[' + id + '] { color: green;\n}')
    const id2 = 'data-v-' + genId('style-import-twice.vue')
    expect(styles[2].textContent).toContain('h1[' + id2 + '] { color: green;\n}')
    done()
  })
})

test('template import', done => {
  mockBundleAndRun({
    entry: 'template-import.vue'
  }, ({ window, module }) => {
    const vnode = mockRender(module)
    // '<div><h1>hello</h1></div>'
    expect(vnode.children[0].tag).toBe('h1')
    expect(vnode.children[0].children[0].text).toBe('hello')
    done()
  })
})

test('template import with pre-processors', done => {
  mockBundleAndRun({
    entry: 'template-import-pre.vue',
    module: {
      rules: [
        {
          test: /\.pug$/,
          loader: 'pug-plain-loader'
        }
      ]
    }
  }, ({ window, module }) => {
    const vnode = mockRender(module)
    // '<div><h1>hello</h1></div>'
    expect(vnode.children[0].tag).toBe('h1')
    expect(vnode.children[0].children[0].text).toBe('hello')
    done()
  })
})

test('script import', done => {
  mockBundleAndRun({
    entry: 'script-import.vue'
  }, ({ window, module }) => {
    expect(module.data().msg).toContain('Hello from Component A!')
    done()
  })
})
