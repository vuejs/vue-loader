const {
  mockRender,
  mockBundleAndRun
} = require('./utils')

test('allow exporting extended constructor', done => {
  mockBundleAndRun({
    entry: 'extend.vue'
  }, ({ window, module }) => {
    // extend.vue should export Vue constructor
    const Component = module
    const vnode = mockRender(Component.options, {
      msg: 'success'
    })
    expect(vnode.tag).toBe('div')
    expect(vnode.children[0].text).toBe('success')
    expect(new Component().msg === 'success')
    done()
  })
})

test('named exports', done => {
  mockBundleAndRun({
    entry: 'named-exports.vue'
  }, ({ exports }) => {
    expect(exports.default.name).toBe('named-exports')
    expect(exports.foo()).toBe(1)
    done()
  })
})
