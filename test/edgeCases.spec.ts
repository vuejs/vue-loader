import { bundle, mockBundleAndRun, normalizeNewline } from './utils'

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
    modify: (config) => {
      config!.module!.rules[0] = {
        test: /\.vue$/,
        include: /fixtures/,
        loader: 'vue-loader',
      }
    },
  })

  assertComponent(result)
})

test.todo('test-less oneOf rules')

// #1210
test('normalize multiple use + options', async () => {
  await bundle({
    entry: 'basic.vue',
    modify: (config) => {
      config!.module!.rules[0] = {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {},
          },
        ],
      }
    },
  })
})

test.todo('should not duplicate css modules value imports')

// #1213
test.todo('html-webpack-plugin')

// #1239
test('usage with null-loader', async () => {
  await mockBundleAndRun({
    entry: 'basic.vue',
    modify: (config) => {
      config!.module!.rules[1] = {
        test: /\.css$/,
        use: ['null-loader'],
      }
    },
  })
})

// #1278
test('proper dedupe on src-imports with options', async () => {
  const result = await mockBundleAndRun({
    entry: 'ts.vue',
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
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
