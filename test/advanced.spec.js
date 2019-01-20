const { SourceMapConsumer } = require('source-map')
const normalizeNewline = require('normalize-newline')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const {
  mfs,
  genId,
  bundle,
  mockBundleAndRun
} = require('./utils')

test('support chaining with other loaders', done => {
  mockBundleAndRun({
    entry: 'basic.vue',
    modify: config => {
      config.module.rules[0] = {
        test: /\.vue$/,
        use: [
          'vue-loader',
          require.resolve('./mock-loaders/js')
        ]
      }
    }
  }, ({ module }) => {
    expect(module.data().msg).toBe('Changed!')
    done()
  })
})

test('inherit queries on files', done => {
  mockBundleAndRun({
    entry: 'basic.vue?change',
    modify: config => {
      config.module.rules[0] = {
        test: /\.vue$/,
        use: [
          'vue-loader',
          require.resolve('./mock-loaders/query')
        ]
      }
    }
  }, ({ module }) => {
    expect(module.data().msg).toBe('Changed!')
    done()
  })
})

test('expose file path as __file outside production', done => {
  mockBundleAndRun({
    entry: 'basic.vue'
  }, ({ module }) => {
    expect(module.__file).toBe('test/fixtures/basic.vue')
    done()
  })
})

test('no __file in production when exposeFilename disabled', done => {
  const origNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  mockBundleAndRun(
    {
      entry: 'basic.vue'
    },
    ({ module }) => {
      expect(module.__file).toBe(undefined)
      process.env.NODE_ENV = origNodeEnv
      done()
    }
  )
})

test('expose file basename as __file in production when exposeFilename enabled', done => {
  const origNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  mockBundleAndRun(
    {
      entry: 'basic.vue',
      vue: {
        exposeFilename: true
      }
    },
    ({ module }) => {
      expect(module.__file).toBe('basic.vue')
      process.env.NODE_ENV = origNodeEnv
      done()
    }
  )
})

test('source map', done => {
  bundle({
    entry: 'basic.vue',
    devtool: '#source-map'
  }, code => {
    const map = mfs.readFileSync('/test.build.js.map', 'utf-8')
    const smc = new SourceMapConsumer(JSON.parse(map))
    let line
    let col
    const targetRE = /^\s+msg: 'Hello from Component A!'/
    code.split(/\r?\n/g).some((l, i) => {
      if (targetRE.test(l)) {
        line = i + 1
        col = 0
        return true
      }
    })
    const pos = smc.originalPositionFor({
      line: line,
      column: col
    })
    expect(pos.source.indexOf('basic.vue') > -1)
    expect(pos.line).toBe(9)
    done()
  })
})

test('extract CSS', done => {
  bundle({
    entry: 'extract-css.vue',
    modify: config => {
      config.module.rules = [
        {
          test: /\.vue$/,
          use: 'vue-loader'
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
        {
          test: /\.stylus$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'stylus-loader'
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'test.output.css'
      })
    ]
  }, code => {
    const css = normalizeNewline(mfs.readFileSync('/test.output.css').toString())
    const id = `data-v-${genId('extract-css.vue')}`
    expect(css).toContain(`h1 {\n  color: #f00;\n}`)
    // extract + scoped
    expect(css).toContain(`h2[${id}] {\n  color: green;\n}`)
    done()
  })
})

test('extract CSS with code spliting', done => {
  bundle({
    entry: 'extract-css-chunks.vue',
    modify: config => {
      config.module.rules = [
        {
          test: /\.vue$/,
          use: 'vue-loader'
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'test.output.css'
      })
    ]
  }, code => {
    const css = normalizeNewline(mfs.readFileSync('/test.output.css').toString())
    expect(css).toContain(`h1 {\n  color: red;\n}`)
    expect(mfs.existsSync('/empty.test.output.css')).toBe(false)
    expect(mfs.existsSync('/basic.test.output.css')).toBe(true)
    done()
  })
})

test('support rules with oneOf', async () => {
  const run = (entry, assert) => new Promise((resolve, reject) => {
    mockBundleAndRun({
      entry,
      modify: config => {
        config.module.rules = [
          { test: /\.vue$/, loader: 'vue-loader' },
          {
            test: /\.css$/,
            use: 'vue-style-loader',
            oneOf: [
              {
                resourceQuery: /module/,
                use: [
                  {
                    loader: 'css-loader',
                    options: {
                      modules: true,
                      localIdentName: '[local]_[hash:base64:5]'
                    }
                  }
                ]
              },
              {
                use: ['css-loader']
              }
            ]
          }
        ]
      }
    }, res => {
      const { jsdomError, bundleError } = res
      if (jsdomError) return reject(jsdomError)
      if (bundleError) return reject(bundleError)
      assert(res)
      resolve()
    })
  })

  await run('basic.vue', ({ window }) => {
    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    expect(style).toContain('comp-a h2 {\n  color: #f00;\n}')
  })

  await run('css-modules-simple.vue', ({ window, instance }) => {
    const className = instance.$style.red
    expect(className).toMatch(/^red_\w{5}/)
    let style = window.document.querySelector('style').textContent
    style = normalizeNewline(style)
    expect(style).toContain('.' + className + ' {\n  color: red;\n}')
  })
})

// TODO
// test('multiple rule definitions', done => {
//   mockBundleAndRun({
//     modify: config => {
//       // remove default rule
//       config.module.rules.shift()
//     },
//     entry: './test/fixtures/multiple-rules.js',
//     module: {
//       rules: [
//         {
//           test: /\.vue$/,
//           oneOf: [
//             {
//               include: /-1\.vue$/,
//               loader: loaderPath,
//               options: {
//                 postcss: [
//                   css => {
//                     css.walkDecls('font-size', decl => {
//                       decl.value = `${parseInt(decl.value, 10) * 2}px`
//                     })
//                   }
//                 ],
//                 compilerModules: [{
//                   postTransformNode: el => {
//                     el.staticClass = '"multiple-rule-1"'
//                   }
//                 }]
//               }
//             },
//             {
//               include: /-2\.vue$/,
//               loader: loaderPath,
//               options: {
//                 postcss: [
//                   css => {
//                     css.walkDecls('font-size', decl => {
//                       decl.value = `${parseInt(decl.value, 10) / 2}px`
//                     })
//                   }
//                 ],
//                 compilerModules: [{
//                   postTransformNode: el => {
//                     el.staticClass = '"multiple-rule-2"'
//                   }
//                 }]
//               }
//             }
//           ]
//         }
//       ]
//     }
//   }, (window, module) => {
//     const vnode1 = mockRender(window.rules[0])
//     const vnode2 = mockRender(window.rules[1])
//     expect(vnode1.data.staticClass).toBe('multiple-rule-1')
//     expect(vnode2.data.staticClass).toBe('multiple-rule-2')
//     const styles = window.document.querySelectorAll('style')
//     const expr = /\.multiple-rule-\d\s*\{\s*font-size:\s*([.0-9]+)px;/
//     for (let i = 0, l = styles.length; i < l; i++) {
//       const content = styles[i].textContent
//       if (expr.test(content)) {
//         expect(parseFloat(RegExp.$1)).toBe(14)
//       }
//     }
//     done()
//   })
// })
