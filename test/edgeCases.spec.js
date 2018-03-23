const {
  bundle,
  mockRender,
  mockBundleAndRun
} = require('./utils')

const normalizeNewline = require('normalize-newline')

const assertComponent = ({ window, module }, done) => {
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
}

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
  }, res => assertComponent(res, done))
})

test('test-less oneOf rules', done => {
  mockBundleAndRun({
    entry: 'basic.vue',
    modify: config => {
      config.module.rules = [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          oneOf: [
            {
              test: /\.css$/,
              use: ['vue-style-loader', 'css-loader']
            }
          ]
        }
      ]
    }
  }, res => assertComponent(res, done))
})

test('babel-loader inline options', done => {
  bundle({
    entry: 'basic.vue',
    module: {
      rules: [
        {
          test: /\.js/,
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              [require('babel-preset-env'), { modules: false }]
            ]
          }
        }
      ]
    }
  }, () => done(), true)
})

// #1210
test('normalize multiple use + options', done => {
  bundle({
    entry: 'basic.vue',
    modify: config => {
      config.module.rules[0] = {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {}
          }
        ]
      }
    }
  }, () => done(), true)
})
