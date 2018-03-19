process.env.VUE_LOADER_TEST = true

const { expect } = require('chai')
const {
  genId,
  mockBundleAndRun,
  mockRender,
  initStylesForAllSubComponents
} = require('./shared')

const normalizeNewline = require('normalize-newline')

describe('basic usage', () => {
  it('basic', done => {
    mockBundleAndRun({
      entry: 'basic.vue'
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

  it('pre-processors', done => {
    mockBundleAndRun({
      entry: 'pre.vue'
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

  it('style import', done => {
    mockBundleAndRun({
      entry: 'style-import.vue'
    }, (window) => {
      const styles = window.document.querySelectorAll('style')
      expect(styles[0].textContent).to.contain('h1 { color: red;\n}')
      // import with scoped
      const id = 'data-v-' + genId('style-import.vue')
      expect(styles[1].textContent).to.contain('h1[' + id + '] { color: green;\n}')
      done()
    })
  })

  it('style import for a same file twice', done => {
    mockBundleAndRun({
      entry: 'style-import-twice.vue'
    }, (window, module) => {
      initStylesForAllSubComponents(module)
      const styles = window.document.querySelectorAll('style')
      expect(styles.length).to.equal(3)
      expect(styles[0].textContent).to.contain('h1 { color: red;\n}')
      // import with scoped
      const id = 'data-v-' + genId('style-import-twice.vue')
      expect(styles[1].textContent).to.contain('h1[' + id + '] { color: green;\n}')
      const id2 = 'data-v-' + genId('style-import-twice-sub.vue')
      expect(styles[2].textContent).to.contain('h1[' + id2 + '] { color: green;\n}')
      done()
    })
  })

  it('template import', done => {
    mockBundleAndRun({
      entry: 'template-import.vue'
    }, (window, module) => {
      const vnode = mockRender(module)
      // '<div><h1>hello</h1></div>'
      expect(vnode.children[0].tag).to.equal('h1')
      expect(vnode.children[0].children[0].text).to.equal('hello')
      done()
    })
  })

  it('script import', done => {
    mockBundleAndRun({
      entry: 'script-import.vue'
    }, (window, module) => {
      expect(module.data().msg).to.contain('Hello from Component A!')
      done()
    })
  })
})
