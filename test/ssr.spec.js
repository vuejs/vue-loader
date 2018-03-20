const SSR = require('vue-server-renderer')

const {
  genId,
  bundle,
  baseConfig,
  interopDefault
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

test('SSR with scoped CSS', done => {
  bundle({
    target: 'node',
    entry: './test/fixtures/ssr-scoped-style.js',
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

      const id = `data-v-${genId('scoped-css.vue')}`

      expect(res).toContain('data-server-rendered')
      expect(res).toContain(`<div ${id}>`)
      expect(res).toContain(`<svg ${id}>`)

      const style = context.styles

      expect(style).toContain(`.test[${id}] {\n  color: yellow;\n}`)
      expect(style).toContain(`.test[${id}]:after {\n  content: \'bye!\';\n}`)
      expect(style).toContain(`h1[${id}] {\n  color: green;\n}`)
      // scoped keyframes
      expect(style).toContain(`.anim[${id}] {\n  animation: color-${id} 5s infinite, other 5s;`)
      expect(style).toContain(`.anim-2[${id}] {\n  animation-name: color-${id}`)
      expect(style).toContain(`.anim-3[${id}] {\n  animation: 5s color-${id} infinite, 5s other;`)
      expect(style).toContain(`@keyframes color-${id} {`)
      expect(style).toContain(`@-webkit-keyframes color-${id} {`)

      expect(style).toContain(
        `.anim-multiple[${id}] {\n  animation: color-${id} 5s infinite,opacity-${id} 2s;`
      )
      expect(style).toContain(`.anim-multiple-2[${id}] {\n  animation-name: color-${id},opacity-${id};`)
      expect(style).toContain(`@keyframes opacity-${id} {`)
      expect(style).toContain(`@-webkit-keyframes opacity-${id} {`)
      // >>> combinator
      expect(style).toContain(`.foo p[${id}] .bar {\n  color: red;\n}`)
      done()
    })
  })
})

test('SSR + CSS Modules', done => {
  const baseLoaders = [
    'vue-style-loader',
    {
      loader: 'css-loader',
      options: { modules: true }
    }
  ]

  bundle({
    entry: 'css-modules.vue',
    target: 'node',
    output: Object.assign({}, baseConfig.output, {
      libraryTarget: 'commonjs2'
    }),
    modify: config => {
      config.module.rules = [
        { test: /\.vue$/, loader: 'vue-loader' },
        {
          test: /\.css$/,
          use: baseLoaders
        },
        {
          test: /\.stylus$/,
          use: [
            ...baseLoaders,
            'stylus-loader'
          ]
        }
      ]
    }
  }, code => {
    // http://stackoverflow.com/questions/17581830/load-node-js-module-from-string-in-memory
    function requireFromString (src, filename) {
      const Module = require('module')
      const m = new Module()
      m._compile(src, filename)
      return m.exports
    }

    const output = interopDefault(requireFromString(code, './test.build.js'))
    const mockInstance = {}

    output.beforeCreate.forEach(hook => hook.call(mockInstance))
    expect(mockInstance.style.red).toBeDefined()
    expect(mockInstance.$style.red).toBeDefined()

    done()
  })
})
