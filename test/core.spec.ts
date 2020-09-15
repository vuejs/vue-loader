import { mockBundleAndRun, normalizeNewline } from './utils'

test('basic', async () => {
  const { window, instance, componentModule } = await mockBundleAndRun({
    entry: 'basic.vue',
  })

  // <h2 class="red">{{msg}}</h2>
  expect(instance.$el.tagName).toBe('H2')
  expect(instance.$el.className).toBe('red')
  expect(instance.$el.textContent).toBe('Hello from Component A!')

  // @ts-ignore
  expect(componentModule.data().msg).toContain('Hello from Component A!')

  const style = normalizeNewline(
    window.document.querySelector('style')!.textContent!
  )
  expect(style).toContain('comp-a h2 {\n  color: #f00;\n}')
})

test('pre-processors', async () => {
  // @ts-ignore
  const { window, instance, code, componentModule } = await mockBundleAndRun({
    entry: 'pre.vue',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
        {
          test: /\.pug$/,
          loader: 'pug-plain-loader',
        },
        {
          test: /\.stylus$/,
          use: ['style-loader', 'css-loader', 'stylus-loader'],
        },
      ],
    },
  })

  // make sure babel is actually applied
  expect(code).toMatch('data: function data()')

  // div
  //   h1 This is the app
  //   comp-a
  //   comp-b
  expect(instance.$el.children[0].tagName).toBe('H1')
  expect(instance.$el.children[1].tagName).toBe('COMP-A')
  expect(instance.$el.children[2].tagName).toBe('COMP-B')

  // script
  // @ts-ignore
  expect(componentModule.data().msg).toContain('Hello from Babel')

  // style
  const style = window.document.querySelector('style')!.textContent!
  expect(style).toContain(
    'body {\n  font: 100% Helvetica, sans-serif;\n  color: #999;\n}'
  )
})

test('script setup', async () => {
  await mockBundleAndRun({ entry: 'ScriptSetup.vue' })
})

test('without script block', async () => {
  await mockBundleAndRun({ entry: 'no-script.vue' })
})
