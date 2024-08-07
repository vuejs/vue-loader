import { mockServerBundleAndRun, genId, DEFAULT_VUE_USE } from './utils'

test('SSR style and moduleId extraction', async () => {
  const { markup, ssrContext } = await mockServerBundleAndRun({
    entry: 'ssr-style.vue',
  })

  expect(markup).toContain('<h1>Hello</h1>')
  expect(markup).toContain('Hello from Component A!')
  expect(markup).toContain('<div class="foo">functional</div>')
  // collect component identifiers during render
  expect(Array.from(ssrContext._registeredComponents).length).toBe(3)
})

test('SSR with scoped CSS', async () => {
  const { markup } = await mockServerBundleAndRun({
    entry: 'scoped-css.vue',
  })

  const shortId = genId('scoped-css.vue')
  const id = `data-v-${shortId}`

  expect(markup).toContain(`<div ${id}>`)
  expect(markup).toContain(`<svg ${id}>`)
})

test('SSR + CSS Modules', async () => {
  const testWithIdent = async (
    localIdentName: string | undefined,
    regexToMatch: RegExp
  ) => {
    const baseLoaders = [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName,
          },
        },
      },
    ]

    const { componentModule } = await mockServerBundleAndRun({
      entry: 'css-modules.vue',
      modify: (config: any) => {
        config!.module!.rules = [
          {
            test: /\.vue$/,
            use: [DEFAULT_VUE_USE],
          },
          {
            test: /\.css$/,
            use: baseLoaders,
          },
          {
            test: /\.stylus$/,
            use: [...baseLoaders, 'stylus-loader'],
          },
        ]
      },
    })

    const instance = componentModule.__cssModules

    // get local class name
    const className = instance!.$style.red
    expect(className).toMatch(regexToMatch)
  }

  // default ident
  await testWithIdent(undefined, /^\w{21,}/)

  // custom ident
  await testWithIdent(
    '[path][name]---[local]---[hash:base64:5]',
    /css-modules---red---\w{5}/
  )
})
