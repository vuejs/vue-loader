import * as path from 'path'
import { DEFAULT_VUE_USE, mockBundleAndRun, normalizeNewline } from './utils'

test('apply babel transformations to expressions in template', async () => {
  const { instance } = await mockBundleAndRun({
    entry: 'optional-chaining.vue',
    module: {
      rules: [
        {
          test: /\.js/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      ],
    },
  })

  expect(instance.$el.tagName).toBe('DIV')
  expect(instance.$el.classList.contains('test-hello')).toBe(true)
  expect(instance.$el.classList.contains('b')).toBe(true)
})

test('transform relative URLs and respects resolve alias', async () => {
  const { window, instance } = await mockBundleAndRun({
    entry: 'resolve.vue',
    resolve: {
      alias: {
        fixtures: path.resolve(__dirname, './fixtures'),
      },
    },
    module: {
      rules: [
        {
          test: /\.png$/,
          loader: 'file-loader',
          options: {
            name: '[name].[hash:6].[ext]',
          },
        },
      ],
    },
  })

  expect(instance.$el.children[0].tagName).toBe('IMG')
  expect(instance.$el.children[0].src).toBe('logo.cab72b.png')
  expect(instance.$el.children[1].tagName).toBe('IMG')
  expect(instance.$el.children[1].src).toBe('logo.cab72b.png')

  // maybe this case should be removed
  // <https://github.com/vuejs/vue-loader/pull/927#issuecomment-714333544>
  expect(instance.$el.children[2].tagName).toBe('IMG')
  expect(instance.$el.children[2].src).toBe('logo.cab72b.png')

  const style = normalizeNewline(
    window.document.querySelector('style')!.textContent!
  )
  expect(style).toContain('html { background-image: url(logo.cab72b.png);\n}')
  expect(style).toContain('body { background-image: url(logo.cab72b.png);\n}')
})

test('customizing template loaders', async () => {
  const { instance } = await mockBundleAndRun({
    entry: 'markdown.vue',
    module: {
      rules: [
        {
          test: /\.md$/,
          loader: 'markdown-loader',
        },
      ],
    },
  })

  // <h2 id="-msg-">{{msg}}</h2>
  expect(instance.$el.tagName).toBe('H2')
  expect(instance.$el.id).toBe('msg')
  expect(instance.$el.textContent).toBe('hi')
})

test.todo('custom compiler options')

test.todo('separate loader configuration for template lang and js imports')

// #1426
test.todo('disable prettify')

test('postLoaders support', async () => {
  const { instance } = await mockBundleAndRun({
    entry: 'basic.vue',
    module: {
      rules: [
        {
          resourceQuery: /^\?vue&type=template/,
          enforce: 'post',
          loader: path.resolve(__dirname, './mock-loaders/html'),
        },
      ],
    },
  })
  // class="red" -> class="green"
  expect(instance.$el.className).toBe('green')
})

// #1879
test('should allow process custom file', async () => {
  const { instance } = await mockBundleAndRun({
    entry: 'process-custom-file/process-custom-file.vue',
    module: {
      rules: [
        {
          test: /\.svg$/,
          use: [DEFAULT_VUE_USE],
        },
      ],
    },
  })

  expect(instance.$el.tagName).toBe('DIV')
  expect(instance.$el.innerHTML).toMatch('ProcessedCustomFile')
})
