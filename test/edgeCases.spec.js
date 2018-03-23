const {
  mockRender,
  mockBundleAndRun
} = require('./utils')

const normalizeNewline = require('normalize-newline')

test('vue rule with include', done => {
  mockBundleAndRun({
    entry: 'basic.vue',
    modify: config => {
      config.module.rules[0] = {
        test: /\.vue$/,
        include: /fixtures/,
        loader: 'vue-loader'
      }
    }
  }, ({ window, module, rawModule }) => {
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
