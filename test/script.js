process.env.VUE_LOADER_TEST = true

const { expect } = require('chai')
const {
  mockBundleAndRun,
  mockRender
} = require('./shared')

describe('script block features', () => {
  it('allows to export extended constructor', done => {
    mockBundleAndRun({
      entry: 'extend.vue'
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

  it('named exports', done => {
    mockBundleAndRun({
      entry: 'named-exports.vue'
    }, (window, _, rawModule) => {
      expect(rawModule.default.name).to.equal('named-exports')
      expect(rawModule.foo()).to.equal(1)
      done()
    })
  })
})
