import * as path from 'path'
import webpack from 'webpack'
import {
  mfs,
  bundle,
  mockBundleAndRun,
  normalizeNewline,
  DEFAULT_VUE_USE,
} from './utils'

// @ts-ignore
function assertComponent({
  // @ts-ignore
  instance,
  // @ts-ignore
  componentModule,
  // @ts-ignore
  window,
  expectedMsg = 'Hello from Component A!',
}) {
  // <h2 class="red">{{msg}}</h2>
  expect(instance.$el.tagName).toBe('H2')
  expect(instance.$el.className).toBe('red')
  expect(instance.$el.textContent).toBe(expectedMsg)

  // @ts-ignore
  expect(componentModule.data().msg).toContain(expectedMsg)

  const style = normalizeNewline(
    window.document.querySelector('style')!.textContent!
  )
  expect(style).toContain('comp-a h2 {\n  color: #f00;\n}')
}

// #1201
test('vue rule with include', async () => {
  const result = await mockBundleAndRun({
    entry: 'basic.vue',
    modify: (config: any) => {
      const i = config.module.rules.findIndex((r) =>
        r.test.toString().includes('vue')
      )
      config.module.rules[i] = {
        test: /\.vue$/,
        include: /fixtures/,
        use: [DEFAULT_VUE_USE],
      }
    },
  })

  assertComponent(result)
})

test('test-less oneOf rules', async () => {
  const result = await mockBundleAndRun({
    entry: 'basic.vue',
    modify: (config: any) => {
      config!.module!.rules = [
        {
          test: /\.vue$/,
          use: [DEFAULT_VUE_USE],
        },
        {
          oneOf: [
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader'],
            },
          ],
        },
      ]
    },
  })

  assertComponent(result)
})

// #1210
test('normalize multiple use + options', async () => {
  await bundle({
    entry: 'basic.vue',
    modify: (config: any) => {
      const i = config.module.rules.findIndex((r) =>
        r.test.toString().includes('vue')
      )
      config!.module!.rules[i] = {
        test: /\.vue$/,
        use: [DEFAULT_VUE_USE],
      }
    },
  })
})

test('should not duplicate css modules value imports', async () => {
  const { window, exports } = await mockBundleAndRun({
    entry: './test/fixtures/duplicate-cssm.js',
    modify: (config: any) => {
      const i = config.module.rules.findIndex((r) =>
        r.test.toString().includes('css')
      )
      config.module.rules[i] = {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      }
    },
  })

  const styles = window.document.querySelectorAll('style')
  expect(styles.length).toBe(2) // one for values, one for the component
  const style = normalizeNewline(styles[1]!.textContent!)
  // value should be injected
  expect(style).toMatch('color: red;')
  // exports is set as the locals imported from values.css
  expect(exports.color).toBe('red')
})

// #1213
test('html-webpack-plugin', async () => {
  const HTMLPlugin = process.env.WEBPACK4
    ? require('html-webpack-plugin')
    : require('html-webpack-plugin-v5')
  await bundle({
    entry: 'basic.vue',
    plugins: [
      new HTMLPlugin({
        inject: true,
        template: path.resolve(__dirname, 'fixtures/index.html'),
        filename: 'output.html',
      }),
    ],
  })

  const html = mfs.readFileSync('/output.html', 'utf-8')
  expect(html).toMatch('test.build.js')
})

// #1239
test('usage with null-loader', async () => {
  await mockBundleAndRun({
    entry: 'basic.vue',
    modify: (config: any) => {
      const i = config.module.rules.findIndex((r) =>
        r.test.toString().includes('css')
      )
      config.module.rules[i] = {
        test: /\.css$/,
        use: ['null-loader'],
      }
    },
  })
})

// #1278
test('proper dedupe on src-imports with options', async () => {
  const tsLoaderPath = process.env.WEBPACK4
    ? require.resolve('ts-loader')
    : require.resolve('ts-loader-v9')
  const result = await mockBundleAndRun({
    entry: 'ts.vue',
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: tsLoaderPath,
          options: { appendTsSuffixTo: [/\.vue$/] },
        },
      ],
    },
  })

  assertComponent(result)
})

// #1351
test('use with postLoader', async () => {
  const result = await mockBundleAndRun({
    entry: 'basic.vue',
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: require.resolve('./mock-loaders/js'),
          },
          enforce: 'post',
        },
      ],
    },
  })
  assertComponent(Object.assign({ expectedMsg: 'Changed!' }, result))
})

// #1771
test('data: URI as entry', async () => {
  // this feature is only available in webpack 5
  if (webpack.version!.startsWith('4')) {
    return
  }

  await bundle({
    entry: {
      main: 'data:text/javascript,console.log("hello world")',
    },
  })
})

// https://github.com/intlify/vue-i18n-next/issues/680
test('should work with i18n loader in production mode', async () => {
  const result = await mockBundleAndRun({
    mode: 'production',
    entry: require.resolve('./fixtures/i18n-entry.js'),
    module: {
      rules: [
        {
          test: /\.(json5?|ya?ml)$/, // target json, json5, yaml and yml files
          type: 'javascript/auto',
          loader: '@intlify/vue-i18n-loader',
        },
        // for i18n custom block
        {
          resourceQuery: /blockType=i18n/,
          type: 'javascript/auto',
          loader: '@intlify/vue-i18n-loader',
        },
      ],
    },
  })

  expect(result.componentModule.__i18n).toHaveLength(1)
})

// #2029
test('should pass correct options to template compiler', async () => {
  const fakeCompiler: any = {
    compile: jest
      .fn()
      .mockReturnValue({ code: 'export function render() { return null; }' }),
  }

  await mockBundleAndRun({
    entry: 'basic.vue',
    modify: (config: any) => {
      config.module.rules[0].use[0].options = {
        compiler: fakeCompiler,
      }
      config.module.rules.push(
        ...Array.from({ length: 10 }).map((_, i) => ({
          test: new RegExp(`\.dummy${i}`),
          loader: 'null-loader',
          options: { dummyRule: i },
        }))
      )
    },
  })

  expect(fakeCompiler.compile).toHaveBeenCalledTimes(1)
})
