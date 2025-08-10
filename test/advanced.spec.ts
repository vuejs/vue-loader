import { SourceMapConsumer } from 'source-map'
import { fs as mfs } from 'memfs'
import cssesc from 'cssesc'
import {
  bundle,
  mockBundleAndRun,
  normalizeNewline,
  genId,
  DEFAULT_VUE_USE,
} from './utils'
import path from 'path'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

test('support chaining with other loaders', async () => {
  const { componentModule } = await mockBundleAndRun({
    entry: 'basic.vue',
    modify: (config) => {
      config!.module!.rules![0] = {
        test: /\.vue$/,
        use: [DEFAULT_VUE_USE, require.resolve('./mock-loaders/js')],
      }
    },
  })

  expect(componentModule.data().msg).toBe('Changed!')
})

test.skip('inherit queries on files', async () => {
  const { componentModule } = await mockBundleAndRun({
    entry: 'basic.vue?change',
    modify: (config) => {
      config!.module!.rules![0] = {
        test: /\.vue$/,
        use: [DEFAULT_VUE_USE, require.resolve('./mock-loaders/query')],
      }
    },
  })

  expect(componentModule.data().msg).toBe('Changed!')
})

test('expose file path as __file outside production', async () => {
  const { componentModule } = await mockBundleAndRun({
    entry: 'basic.vue',
  })

  expect(componentModule.__file).toBe('test/fixtures/basic.vue')
})

test('no __file in production when exposeFilename disabled', async () => {
  const { componentModule } = await mockBundleAndRun({
    mode: 'production',
    entry: 'basic.vue',
  })

  expect(componentModule.__file).toBe(undefined)
})
test('expose file basename as __file in production when exposeFilename enabled', async () => {
  const { componentModule } = await mockBundleAndRun({
    mode: 'production',
    entry: 'basic.vue',
    vue: {
      exposeFilename: true,
    },
  })
  expect(componentModule.__file).toBe('basic.vue')
})

test('use absolute path', async () => {
  const { componentModule } = await mockBundleAndRun({
    mode: 'development',
    entry: 'basic.vue',
    vue: {
      useAbsolutePath: true,
    },
  })

  expect(componentModule.__file).toBe(
    path.join(__dirname, 'fixtures/basic.vue')
  )
})

test('use absolute path and expose filename in production', async () => {
  const { componentModule } = await mockBundleAndRun({
    mode: 'development',
    entry: 'basic.vue',
    vue: {
      useAbsolutePath: true,
      exposeFilename: true,
    },
  })

  expect(componentModule.__file).toBe(
    path.join(__dirname, 'fixtures/basic.vue')
  )
})

test.skip('source map', async () => {
  const { code } = await bundle({
    entry: 'basic.vue',
    devtool: 'source-map',
  })
  const map = mfs.readFileSync('/test.build.js.map', 'utf-8')
  const smc = new SourceMapConsumer(JSON.parse(map as string))
  let line = 0
  let col = 0
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
    column: col,
  })
  expect(pos.source.indexOf('basic.vue') > -1)
  expect(pos.line).toBe(9)
})

test('extract CSS', async () => {
  await bundle({
    entry: 'extract-css.vue',
    modify: (config: any) => {
      config.module.rules = [
        {
          test: /\.vue$/,
          use: [DEFAULT_VUE_USE],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.stylus$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
        },
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'test.output.css',
      }),
    ],
  })

  const css = normalizeNewline(mfs.readFileSync('/test.output.css').toString())
  const id = `data-v-${genId('extract-css.vue')}`
  expect(css).toContain(`h1 {\n  color: #f00;\n}`)
  // extract + scoped
  expect(css).toContain(`h2[${id}] {\n  color: green;\n}`)
})

// #1464
test('extract CSS with code spliting', async () => {
  await bundle({
    entry: 'extract-css-chunks.vue',
    modify: (config: any) => {
      config.module.rules = [
        {
          test: /\.vue$/,
          use: [DEFAULT_VUE_USE],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'test.output.css',
      }),
    ],
  })

  const css = normalizeNewline(mfs.readFileSync('/test.output.css').toString())
  expect(css).toContain(`h1 {\n  color: red;\n}`)
  expect(mfs.existsSync('/empty.test.output.css')).toBe(false)
  expect(mfs.existsSync('/basic.test.output.css')).toBe(true)
})

test('support rules with oneOf', async () => {
  const run = (entry: string) => {
    return mockBundleAndRun({
      entry,
      modify: (config: any) => {
        config!.module!.rules = [
          {
            test: /\.vue$/,
            use: [DEFAULT_VUE_USE],
          },
          {
            test: /\.css$/,
            use: 'style-loader',
            oneOf: [
              {
                resourceQuery: /module/,
                use: [
                  {
                    loader: 'css-loader',
                    options: {
                      modules: {
                        localIdentName: '[local]_[hash:base64:5]',
                      },
                    },
                  },
                ],
              },
              {
                use: ['css-loader'],
              },
            ],
          },
        ]
      },
    })
  }

  const { window: window1 } = await run('basic.vue')
  let style = normalizeNewline(
    window1.document.querySelector('style')!.textContent!
  )
  expect(style).toContain('comp-a h2 {\n  color: #f00;\n}')

  const { window, instance } = await run('css-modules-simple.vue')

  const className = instance.$style.red
  const escapedClassName = cssesc(instance.$style.red, { isIdentifier: true })
  expect(className).toMatch(/^red_.{5}/)
  style = normalizeNewline(window.document.querySelector('style')!.textContent!)
  expect(style).toContain('.' + escapedClassName + ' {\n  color: red;\n}')
})

test.todo('should work with eslint loader')

test.todo('multiple rule definitions')
