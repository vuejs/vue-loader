import { bundle, mockBundleAndRun } from './utils'

test('add custom blocks to the webpack output', async () => {
  const { code } = await bundle({
    entry: 'custom-language.vue',
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

  // should also be transpiled
  expect(code).toContain(
    `
describe('example', function () {
  it('basic', function (done) {
    done();
  });
});
  `.trim()
  )
})

test('custom blocks should work with src imports', async () => {
  const { code } = await bundle({
    entry: 'custom-import.vue',
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

  expect(code).toContain(
    `
describe('example', function () {
  it('basic', function (done) {
    done();
  });
});
  `.trim()
  )
})

test('passes Component to custom block loaders', async () => {
  const { componentModule } = await mockBundleAndRun({
    entry: 'custom-language.vue',
    module: {
      rules: [
        {
          resourceQuery: /blockType=documentation/,
          loader: require.resolve('./mock-loaders/docs'),
        },
      ],
    },
  })

  expect(componentModule.__docs).toContain(
    'This is example documentation for a component.'
  )
})

test('custom blocks can be ignored', async () => {
  const { code } = await bundle({
    entry: 'custom-language.vue',
  })
  expect(code).not.toContain(`describe('example'`)
})
