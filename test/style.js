process.env.VUE_LOADER_TEST = true

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const {
  genId,
  test,
  mockRender
} = require('./shared')

const normalizeNewline = require('normalize-newline')

describe('style block features', () => {
  it('scoped style', done => {
    test({
      entry: 'scoped-css.vue'
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

  it('media-query', done => {
    test({
      entry: 'media-query.vue'
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
      entry: 'supports-query.vue'
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      const id = 'data-v-' + genId('supports-query.vue')
      expect(style).to.contain('@supports ( color: #000 ) {\n.foo[' + id + '] {\n    color: #000;\n}\n}')
      done()
    })
  })

  it('postcss options', done => {
    test({
      entry: 'postcss.vue',
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
      entry: 'postcss.vue'
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('h1 {\n  color: red;\n  font-size: 14px\n}')
      fs.unlinkSync('.postcssrc')
      done()
    })
  })

  it('load cascading postcss config file', done => {
    fs.writeFileSync('.postcssrc', JSON.stringify({ parser: 'sugarss' }))
    test({
      entry: 'sub/postcss-cascade.vue',
      vue: { postcss: { cascade: true }}
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('display: -webkit-box')
      fs.unlinkSync('.postcssrc')
      done()
    })
  })

  it('load postcss config file by path', done => {
    fs.writeFileSync('test/.postcssrc', JSON.stringify({ parser: 'sugarss' }))
    test({
      entry: 'postcss.vue',
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
      entry: 'basic.vue'
    }, (window, module, vueModule, instance, jsdomErr, webpackInfo) => {
      const { stats: { compilation: { warnings, errors }}, err } = webpackInfo
      expect(jsdomErr).to.be.null
      expect(err).to.be.null
      expect(errors).to.be.empty
      expect(warnings.length).to.equal(1)
      expect(warnings[0]).to.match(/Error loading PostCSS config\:/)
      fs.unlinkSync('.postcssrc.js')
      done()
    }, true)
  })

  it('postcss lang', done => {
    test({
      entry: 'postcss-lang.vue'
    }, (window) => {
      let style = window.document.querySelector('style').textContent
      style = normalizeNewline(style)
      expect(style).to.contain('h1 {\n  color: red;\n  font-size: 14px\n}')
      done()
    })
  })

  it('css-modules', done => {
    function testWithIdent (localIdentName, regexToMatch, cb) {
      test({
        entry: 'css-modules.vue',
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
    testWithIdent(undefined, /^red_\w{8}/, () => {
      // specified localIdentName
      const ident = '[path][name]---[local]---[hash:base64:5]'
      const regex = /css-modules---red---\w{5}/
      testWithIdent(ident, regex, done)
    })
  })
})
