process.env.VUE_LOADER_TEST = true

const { expect } = require('chai')
const {
  mfs,
  bundle,
  test,
  mockRender
} = require('./shared')

const normalizeNewline = require('normalize-newline')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

describe('custom block features', () => {
  it('extract custom blocks to a separate file', done => {
    bundle({
      entry: 'custom-language.vue',
      vue: {
        loaders: {
          'documentation': ExtractTextPlugin.extract('raw-loader')
        }
      },
      plugins: [
        new ExtractTextPlugin('doc.md')
      ]
    }, (code, warnings) => {
      let unitTest = mfs.readFileSync('/doc.md').toString()
      unitTest = normalizeNewline(unitTest)
      expect(unitTest).to.contain('This is example documentation for a component.')
      done()
    })
  })

  it('add custom blocks to the webpack output', done => {
    bundle({
      entry: 'custom-language.vue',
      vue: {
        loaders: {
          'unit-test': 'babel-loader'
        }
      }
    }, (code, warnings) => {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('custom blocks work with src imports', done => {
    bundle({
      entry: 'custom-import.vue',
      vue: {
        loaders: {
          'unit-test': 'babel-loader'
        }
      }
    }, (code, warnings) => {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('passes Component to custom block loaders', done => {
    const mockLoaderPath = require.resolve('./mock-loaders/docs')
    test({
      entry: 'custom-language.vue',
      vue: {
        loaders: {
          'documentation': mockLoaderPath
        }
      }
    }, (window, module) => {
      expect(module.__docs).to.contain('This is example documentation for a component.')
      done()
    })
  })

  it('custom blocks can be ignored', done => {
    bundle({
      entry: 'custom-language.vue'
    }, (code, warnings) => {
      expect(code).not.to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('custom blocks with ES module default export', done => {
    test({
      entry: 'custom-blocks.vue',
      vue: {
        loaders: {
          esm: require.resolve('./mock-loaders/identity')
        }
      }
    }, (window, module) => {
      // option added by custom block code
      expect(module.foo).to.equal(1)
      done()
    })
  })

  it('passes attributes as options to the loader', done => {
    bundle({
      entry: 'custom-options.vue',
      vue: {
        loaders: {
          'unit-test': 'babel-loader!skeleton-loader'
        }
      },
      plugins: [
        new webpack.LoaderOptionsPlugin({
          options: {
            skeletonLoader: {
              procedure: (content, sourceMap, callback, options) => {
                expect(options.foo).to.equal('bar')
                expect(options.opt2).to.equal('value2')

                // Return the content to output.
                return content
              }
            }
          }
        })
      ]
    }, (code, warnings) => {
      expect(code).to.contain('describe(\'example\', function () {\n  it(\'basic\', function (done) {\n    done();\n  });\n})')
      done()
    })
  })

  it('pre/post loaders for custom blocks', done => {
    test({
      entry: 'custom-blocks.vue',
      vue: {
        preLoaders: {
          i18n: require.resolve('./mock-loaders/yaml')
        },
        loaders: {
          i18n: require.resolve('./mock-loaders/i18n'),
          blog: 'marked'
        },
        postLoaders: {
          blog: require.resolve('./mock-loaders/blog')
        }
      }
    }, (window, module) => {
      const vnode = mockRender(module, {
        msg: JSON.parse(module.__i18n).en.hello,
        blog: module.__blog
      })
      expect(vnode.children[0].children[0].text).to.equal('hello world')
      expect(vnode.children[2].data.domProps.innerHTML).to.equal('<h2 id="foo">foo</h2>')
      done()
    })
  })
})
