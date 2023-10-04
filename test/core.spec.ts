import { mockBundleAndRun, normalizeNewline, genId } from './utils'

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
  const style = normalizeNewline(
    window.document.querySelector('style')!.textContent!
  )
  expect(style).toContain(
    'body {\n  font: 100% Helvetica, sans-serif;\n  color: #999;\n}'
  )
})

test('style import', async () => {
  const { window } = await mockBundleAndRun({
    entry: 'style-import.vue',
  })

  const styles = window.document.querySelectorAll('style')
  expect(styles[0].textContent).toContain('h1 { color: red; }')

  // import with scoped
  const id = 'data-v-' + genId('style-import.vue')
  expect(styles[1].textContent).toContain('h1[' + id + '] { color: green;\n}')
})

test('style import for a same file twice', async () => {
  const { window } = await mockBundleAndRun({
    entry: 'style-import-twice.vue',
  })

  const styles = window.document.querySelectorAll('style')
  expect(styles.length).toBe(3)
  expect(styles[0].textContent).toContain('h1 { color: red; }')

  // import with scoped
  const id = 'data-v-' + genId('style-import-twice-sub.vue')
  expect(styles[1].textContent).toContain('h1[' + id + '] { color: green;\n}')
  const id2 = 'data-v-' + genId('style-import-twice.vue')
  expect(styles[2].textContent).toContain('h1[' + id2 + '] { color: green;\n}')
})

test('template import', async () => {
  const { instance } = await mockBundleAndRun({
    entry: 'template-import.vue',
  })

  const el: Element = instance.$el
  // '<div><h1>hello</h1></div>'
  expect(el.children[0].tagName).toBe('H1')
  expect(el.children[0].textContent).toBe('hello')
})

test('template import with pre-processors', async () => {
  const { instance } = await mockBundleAndRun({
    entry: 'template-import-pre.vue',
    module: {
      rules: [
        {
          test: /\.pug$/,
          loader: 'pug-plain-loader',
        },
      ],
    },
  })

  const el: Element = instance.$el
  // '<div><h1>hello</h1></div>'
  expect(el.children[0].tagName).toBe('H1')
  expect(el.children[0].textContent).toBe('hello')
})

test('script import', async () => {
  const { componentModule } = await mockBundleAndRun({
    entry: 'script-import.vue',
  })
  expect(componentModule.data().msg).toContain('Hello from Component A!')
})

// #1620
test('cloned rules should not intefere with each other', async () => {
  await mockBundleAndRun({
    entry: 'basic.vue',
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {},
            },
          ],
        },
        {
          test: /\.some-random-extension$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                url: true,
              },
            },
          ],
        },
      ],
    },
  })
})

test('without script block', async () => {
  await mockBundleAndRun({ entry: 'no-script.vue' })
})
