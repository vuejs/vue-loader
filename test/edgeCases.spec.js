const path = require('path')
const normalizeNewline = require('normalize-newline')
const HTMLPlugin = require('html-webpack-plugin')

const {
  mfs,
  bundle,
  mockRender,
  mockBundleAndRun
} = require('./utils')

const assertComponent = ({ window, module }, done) => {
  if (typeof module === 'function') {
    module = module.options
  }

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

test('should not duplicate css modules value imports', done => {
  mockBundleAndRun({
    entry: './test/fixtures/duplicate-cssm.js',
    modify: config => {
      config.module.rules[1] = {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    }
  }, ({ window, exports, code }) => {
    const localsRE = /exports.locals = {\s+"color": "red"\s+};/
    const matches = code.match(localsRE)
    expect(matches.length).toBe(1)

    const styles = window.document.querySelectorAll('style')
    expect(styles.length).toBe(2) // one for values, one for the component
    const style = normalizeNewline(styles[1].textContent)
    // value should be injected
    expect(style).toMatch('color: red;')
    // exports is set as the locals imported from values.css
    expect(exports.color).toBe('red')
    done()
  })
})

test('html-webpack-plugin', done => {
  bundle({
    entry: 'basic.vue',
    plugins: [
      new HTMLPlugin({
        inject: true,
        template: path.resolve(__dirname, 'fixtures/index.html'),
        filename: 'output.html'
      })
    ]
  }, () => {
    const html = mfs.readFileSync('/output.html', 'utf-8')
    expect(html).toMatch('test.build.js')
    done()
  }, true)
})

test('usage with null-loader', done => {
  mockBundleAndRun({
    entry: 'basic.vue',
    modify: config => {
      config.module.rules[1] = {
        test: /\.css$/,
        use: ['null-loader']
      }
    }
  }, ({ window, exports, code }) => {
    done()
  })
})

test('proper dedupe on src-imports with options', done => {
  mockBundleAndRun({
    entry: 'ts.vue',
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: { appendTsSuffixTo: [/\.vue$/] }
        }
      ]
    }
  }, res => assertComponent(res, done))
})
