const {
  bundle,
  mockBundleAndRun
} = require('./utils')

test('add custom blocks to the webpack output', done => {
  bundle({
    entry: 'custom-language.vue',
    module: {
      rules: [
        { test: /\.js/, loader: 'babel-loader' }
      ]
    }
  }, code => {
    // should also be transpiled
    expect(code).toContain(`
describe('example', function () {
  it('basic', function (done) {
    done();
  });
});
    `.trim())
    done()
  })
})

test('custom blocks should work with src imports', done => {
  bundle({
    entry: 'custom-import.vue',
    module: {
      rules: [
        { test: /\.js/, loader: 'babel-loader' }
      ]
    }
  }, (code) => {
    expect(code).toContain(`
describe('example', function () {
  it('basic', function (done) {
    done();
  });
});
    `.trim())
    done()
  })
})

test('passes Component to custom block loaders', done => {
  mockBundleAndRun({
    entry: 'custom-language.vue',
    module: {
      rules: [
        {
          resourceQuery: /blockType=documentation/,
          loader: require.resolve('./mock-loaders/docs')
        }
      ]
    }
  }, ({ module }) => {
    expect(module.__docs).toContain('This is example documentation for a component.')
    done()
  })
})

test('custom blocks can be ignored', done => {
  bundle({
    entry: 'custom-language.vue'
  }, code => {
    expect(code).not.toContain(`describe('example'`)
    done()
  })
})
