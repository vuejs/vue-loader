const normalizeNewline = require('normalize-newline')
const {
  genId,
  mockRender,
  mockBundleAndRun
} = require('./utils')

test('scoped style', done => {
  mockBundleAndRun({
    entry: 'scoped-css.vue'
  }, ({ window, module }) => {
    const id = 'data-v-' + genId('scoped-css.vue')
    expect(module._scopeId).toBe(id)

    const vnode = mockRender(module, {
      ok: true
    })
    // <div>
    //   <div><h1>hi</h1></div>
    //   <p class="abc def">hi</p>
    //   <template v-if="ok"><p class="test">yo</p></template>
    //   <svg><template><p></p></template></svg>
    // </div>
    expect(vnode.children[0].tag).toBe('div')
    expect(vnode.children[1].text).toBe(' ')
    expect(vnode.children[2].tag).toBe('p')
    expect(vnode.children[2].data.staticClass).toBe('abc def')
    expect(vnode.children[4].tag).toBe('p')
    expect(vnode.children[4].data.staticClass).toBe('test')

    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    expect(style).toContain(`.test[${id}] {\n  color: yellow;\n}`)
    expect(style).toContain(`.test[${id}]:after {\n  content: \'bye!\';\n}`)
    expect(style).toContain(`h1[${id}] {\n  color: green;\n}`)
    // scoped keyframes
    expect(style).toContain(`.anim[${id}] {\n  animation: color-${id} 5s infinite, other 5s;`)
    expect(style).toContain(`.anim-2[${id}] {\n  animation-name: color-${id}`)
    expect(style).toContain(`.anim-3[${id}] {\n  animation: 5s color-${id} infinite, 5s other;`)
    expect(style).toContain(`@keyframes color-${id} {`)
    expect(style).toContain(`@-webkit-keyframes color-${id} {`)

    expect(style).toContain(
      `.anim-multiple[${id}] {\n  animation: color-${id} 5s infinite,opacity-${id} 2s;`
    )
    expect(style).toContain(`.anim-multiple-2[${id}] {\n  animation-name: color-${id},opacity-${id};`)
    expect(style).toContain(`@keyframes opacity-${id} {`)
    expect(style).toContain(`@-webkit-keyframes opacity-${id} {`)
    // >>> combinator
    expect(style).toContain(`.foo p[${id}] .bar {\n  color: red;\n}`)
    done()
  })
})

test('media-query', done => {
  mockBundleAndRun({
    entry: 'media-query.vue'
  }, ({ window }) => {
    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    const id = 'data-v-' + genId('media-query.vue')
    expect(style).toContain('@media print {\n.foo[' + id + '] {\n    color: #000;\n}\n}')
    done()
  })
})

test('supports-query', done => {
  mockBundleAndRun({
    entry: 'supports-query.vue',
    suppressJSDOMConsole: true
  }, ({ window }) => {
    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    const id = 'data-v-' + genId('supports-query.vue')
    expect(style).toContain('@supports ( color: #000 ) {\n.foo[' + id + '] {\n    color: #000;\n}\n}')
    done()
  })
})

test('postcss', done => {
  mockBundleAndRun({
    entry: 'postcss.vue',
    module: {
      rules: [
        {
          test: /\.postcss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                parser: require('sugarss')
              }
            }
          ]
        }
      ]
    }
  }, ({ window }) => {
    const id = 'data-v-' + genId('postcss.vue')
    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    expect(style).toContain(`h1[${id}] {\n  color: red;\n  font-size: 14px\n}`)
    done()
  })
})

// test('css-modules', done => {
//   function testWithIdent (localIdentName, regexToMatch, cb) {
//     mockBundleAndRun({
//       entry: 'css-modules.vue',
//       vue: {
//         cssModules: localIdentName && {
//           localIdentName: localIdentName
//         }
//       }
//     }, (window, module, raw, instance) => {
//       // get local class name
//       const className = instance.style.red
//       expect(className).toMatch(regexToMatch)

//       // class name in style
//       let style = [].slice.call(window.document.querySelectorAll('style')).map((style) => {
//         return style.textContent
//       }).join('\n')
//       style = normalizeNewline(style)
//       expect(style).toContain('.' + className + ' {\n  color: red;\n}')

//       // animation name
//       const match = style.match(/@keyframes\s+(\S+)\s+{/)
//       expect(match).toHaveLength(2)
//       const animationName = match[1]
//       expect(animationName).not.toBe('fade')
//       expect(style).toContain('animation: ' + animationName + ' 1s;')

//       // default module + pre-processor + scoped
//       const anotherClassName = instance.$style.red
//       expect(anotherClassName).to.match(regexToMatch).not.toBe(className)
//       const id = 'data-v-' + genId('css-modules.vue')
//       expect(style).toContain('.' + anotherClassName + '[' + id + ']')

//       cb()
//     })
//   }
//   // default localIdentName
//   testWithIdent(undefined, /^red_\w{8}/, () => {
//     // specified localIdentName
//     const ident = '[path][name]---[local]---[hash:base64:5]'
//     const regex = /css-modules---red---\w{5}/
//     testWithIdent(ident, regex, done)
//   })
// })
