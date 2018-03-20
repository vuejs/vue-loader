const SSR = require('vue-server-renderer')

const {
  bundle
} = require('./utils')

test('SSR style and moduleId extraction', done => {
  bundle({
    target: 'node',
    entry: './test/fixtures/ssr-style.js',
    output: {
      path: '/',
      filename: 'test.build.js',
      libraryTarget: 'commonjs2'
    },
    externals: ['vue']
  }, code => {
    const renderer = SSR.createBundleRenderer(code, {
      basedir: __dirname,
      runInNewContext: 'once'
    })
    const context = {
      _registeredComponents: new Set()
    }
    renderer.renderToString(context, (err, res) => {
      if (err) return done(err)
      expect(res).toContain('data-server-rendered')
      expect(res).toContain('<h1>Hello</h1>')
      expect(res).toContain('Hello from Component A!')
      expect(res).toContain('<div class="foo">functional</div>')
      // from main component
      expect(context.styles).toContain('h1 { color: green;')
      // from imported child component
      expect(context.styles).toContain('comp-a h2 {\n  color: #f00;')
      // from imported css file
      expect(context.styles).toContain('h1 { color: red;')
      // from imported functional component
      expect(context.styles).toContain('.foo { color: red;')
      // collect component identifiers during render
      expect(Array.from(context._registeredComponents).length).toBe(3)
      done()
    })
  })
})

// TODO
// test('css-modules in SSR', done => {
//   bundle({
//     entry: 'css-modules.vue',
//     target: 'node',
//     output: Object.assign({}, globalConfig.output, {
//       libraryTarget: 'commonjs2'
//     })
//   }, (code, warnings) => {
//     // http://stackoverflow.com/questions/17581830/load-node-js-module-from-string-in-memory
//     function requireFromString (src, filename) {
//       const Module = module.constructor
//       const m = new Module()
//       m._compile(src, filename)
//       return m.exports
//     }

//     const output = interopDefault(requireFromString(code, './test.build.js'))
//     const mockInstance = {}

//     output.beforeCreate.forEach(hook => hook.call(mockInstance))
//     expect(mockInstance.style.red).toBeDefined()

//     done()
//   })
// })
