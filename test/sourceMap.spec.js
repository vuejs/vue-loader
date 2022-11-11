const { SourceMapConsumer } = require('source-map')
const { mfs, bundle } = require('./utils')

test('source map', done => {
  bundle({
    entry: 'basic.vue',
    devtool: 'source-map'
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
