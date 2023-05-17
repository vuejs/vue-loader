import { mockBundleAndRun, genId, normalizeNewline } from './utils'

test('scoped style', async () => {
  const { window, instance, componentModule } = await mockBundleAndRun({
    entry: 'scoped-css.vue',
  })

  const shortId = genId('scoped-css.vue')
  const scopeId = 'data-v-' + shortId
  expect(componentModule.__scopeId).toBe(scopeId)

  // <div>
  //   <div><h1>hi</h1></div>
  //   <p class="abc def">hi</p>
  //   <template v-if="ok"><p class="test">yo</p></template>
  //   <svg><template><p></p></template></svg>
  // </div>
  expect(instance.$el.children[0].tagName).toBe('DIV')
  expect(instance.$el.children[1].tagName).toBe('P')
  expect(instance.$el.children[1].className).toBe('abc def')
  expect(instance.$el.children[2].tagName).toBe('P')
  expect(instance.$el.children[2].className).toBe('test')

  const style = normalizeNewline(
    window.document.querySelector('style')!.textContent!
  )

  expect(style).toContain(`.test[${scopeId}] {\n  color: yellow;\n}`)
  expect(style).toContain(`.test[${scopeId}]:after {\n  content: \'bye!\';\n}`)
  expect(style).toContain(`h1[${scopeId}] {\n  color: green;\n}`)
  // scoped keyframes
  // note: vue 3 uses short ids for keyframes
  // see https://github.com/vuejs/vue-next/commit/5f271515cf17e541a2a085d23854dac7e45e074e
  expect(style).toContain(
    `.anim[${scopeId}] {\n  animation: color-${shortId} 5s infinite, other 5s;`
  )
  expect(style).toContain(
    `.anim-2[${scopeId}] {\n  animation-name: color-${shortId}`
  )
  expect(style).toContain(
    `.anim-3[${scopeId}] {\n  animation: 5s color-${shortId} infinite, 5s other;`
  )
  expect(style).toContain(`@keyframes color-${shortId} {`)
  expect(style).toContain(`@-webkit-keyframes color-${shortId} {`)

  expect(style).toContain(
    `.anim-multiple[${scopeId}] {\n  animation: color-${shortId} 5s infinite,opacity-${shortId} 2s;`
  )
  expect(style).toContain(
    `.anim-multiple-2[${scopeId}] {\n  animation-name: color-${shortId},opacity-${shortId};`
  )
  expect(style).toContain(`@keyframes opacity-${shortId} {`)
  expect(style).toContain(`@-webkit-keyframes opacity-${shortId} {`)
  // >>> combinator
  expect(style).toContain(`.foo p[${scopeId}] .bar {\n  color: red;\n}`)
})

test('postcss', async () => {
  const { window } = await mockBundleAndRun({
    entry: 'postcss.vue',
    module: {
      rules: [
        {
          test: /\.postcss$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  parser: require('sugarss'),
                },
              },
            },
          ],
        },
      ],
    },
  })

  const id = 'data-v-' + genId('postcss.vue')
  const style = normalizeNewline(
    window.document.querySelector('style')!.textContent!
  )
  expect(style).toContain(`h1[${id}] {\n  color: red;\n  font-size: 14px\n}`)
})

describe('CSS Modules', () => {
  const fixtureFolder = 'css-modules/'
  const defaultIdent = [undefined, /^[\w-+]{21,}/, /^[\w-+]{21,}/] // pass w/ apply
  const customIdent = '[path][name]---[local]---[hash:base64:5]'

  const testWithIdent = async (
    entry: string,
    localIdentName: string | undefined
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
    const mockResult = await mockBundleAndRun({
      entry: fixtureFolder + entry,
      modify: (config: any) => {
        config!.module!.rules = [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
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
    return mockResult
  }

  test('default/nameless module ($style)', async () => {
    const ENTRY = 'default.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatch: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const className = instance.$style.red
      expect(className).toMatch(regexToMatch)

      // class name in style
      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      expect(style).toContain('.' + className + ' {\n  color: red;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-default---red---[\w-+]{5}/
    )
  })

  test('named module (module="named")', async () => {
    const ENTRY = 'named.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatch: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const className = instance.named.red
      expect(className).toMatch(regexToMatch)

      // class name in style
      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      expect(style).toContain('.' + className + ' {\n  color: red;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-named---red---[\w-+]{5}/
    )
  })

  test('multiple default/multiple modules', async () => {
    const ENTRY = 'default-multiple.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatchA: RegExp,
      regexToMatchB: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const classNameA = instance.$style.red
      const classNameB = instance.$style.blue
      expect(classNameA).toMatch(regexToMatchA)
      expect(classNameB).toMatch(regexToMatchB)

      // class name in style
      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      expect(style).toContain('.' + classNameA + ' {\n  color: red;\n}')
      expect(style).toContain('.' + classNameB + ' {\n  color: blue;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-default-multiple---red---[\w-+]{5}/,
      /test-fixtures-css-modules-default-multiple---blue---[\w-+]{5}/
    )
  })

  test('multiple named modules (same module names, different class names)', async () => {
    const ENTRY = 'named-multiple.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatchA: RegExp,
      regexToMatchB: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const classNameA = instance.named.red
      const classNameB = instance.named.blue
      expect(classNameA).toMatch(regexToMatchA)
      expect(classNameB).toMatch(regexToMatchB)

      // class name in style
      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      expect(style).toContain('.' + classNameA + ' {\n  color: red;\n}')
      expect(style).toContain('.' + classNameB + ' {\n  color: blue;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-named-multiple---red---[\w-+]{5}/,
      /test-fixtures-css-modules-named-multiple---blue---[\w-+]{5}/
    )
  })

  test('multiple named modules (different module names, different class names)', async () => {
    const ENTRY = 'named-multiple-diffnamediffclass.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatchA: RegExp,
      regexToMatchB: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const classNameA = instance.name1.red
      const classNameB = instance.name2.blue
      expect(classNameA).toMatch(regexToMatchA)
      expect(classNameB).toMatch(regexToMatchB)

      // class name in style
      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      expect(style).toContain('.' + classNameA + ' {\n  color: red;\n}')
      expect(style).toContain('.' + classNameB + ' {\n  color: blue;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-named-multiple-diffnamediffclass---red---[\w-+]{5}/,
      /test-fixtures-css-modules-named-multiple-diffnamediffclass---blue---[\w-+]{5}/
    )
  })

  test('multiple named modules (different module names, same class name)', async () => {
    const ENTRY = 'named-multiple-diffnamesameclass.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatchA: RegExp,
      regexToMatchB: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const classNameA = instance.name1.red
      const classNameB = instance.name2.red
      expect(classNameA).toMatch(regexToMatchA)
      expect(classNameB).toMatch(regexToMatchB)

      /*
      !!BROKEN!!, classes have same name+hash
      hash not taking module name into account
      vue-loader needs to pass to css-loader too!
      */
      expect(classNameA).not.toMatch(classNameB)

      // class name in style
      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      expect(style).toContain('.' + classNameA + ' {\n  color: red;\n}')
      expect(style).toContain('.' + classNameB + ' {\n  color: red;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-named-multiple-diffnamesameclass---red---[\w-+]{5}/,
      /test-fixtures-css-modules-named-multiple-diffnamesameclass---blue---[\w-+]{5}/
    )
  })

  test('default/nameless extend (same class name)', async () => {
    const ENTRY = 'default-extend.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatch: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const className = instance.$style.red // extended
      expect(className).toMatch(regexToMatch)
      // class name in style
      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      /*
        !!BROKEN!!,
        extend is adding both classes to style
        but instance.$style.red className points
        to the file's original style (hexcolor)
        (a677feb62ef42886b712f1b16b71e851-vue)
        and not the extended version (red keyword)
        e.g.

        ._7ef3af38102f7bc2284518b4f9dda8d9-vue {
            color: red;
        }
        .a677feb62ef42886b712f1b16b71e851-vue {
            color: #FF0000;
        }
      */
      expect(style).toContain('.' + className + ' {\n  color: red;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-default-extend---red---[\w-+]{5}/
    )
  })

  test('default/nameless extend (different classes)', async () => {
    const ENTRY = 'default-extend-diffclass.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatchA: RegExp,
      regexToMatchB: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const classNameA = instance.$style.black // own style
      const classNameB = instance.$style.red // extended

      expect(classNameA).toMatch(regexToMatchA)
      expect(classNameB).toMatch(regexToMatchB)
      /*
        !!BROKEN!!,
        styles for both own file's style tag and the
        extended file are being added to style tags
        in document BUT instance.$style has not received the
        `red` in the hashmap so instance.$style does't exist

        instance.$style
        { black: "dd07afd7f1529b35227b9b3bc7609e28-vue" }


        styles

        ._7ef3af38102f7bc2284518b4f9dda8d9-vue {
            color: red;
        }


        .dd07afd7f1529b35227b9b3bc7609e28-vue {
            color: #000000;
        }
      */
      // class name in style
      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      expect(style).toContain('.' + classNameA + ' {\n  color: #000000;\n}')
      expect(style).toContain('.' + classNameB + ' {\n  color: red;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-default-extend-diffclass---black---[\w-+]{5}/,
      /test-fixtures-css-modules-default-extend-diffclass---red---[\w-+]{5}/
    )
  })

  test('default/nameless extend w/ compose importing css file', async () => {
    const ENTRY = 'default-extend-composes-css.vue'

    const expectations = async (
      localIdentName: string | undefined,
      regexToMatchA: RegExp,
      regexToMatchB: RegExp
    ) => {
      const { window, instance } = await testWithIdent(ENTRY, localIdentName)
      // get local class name
      const className = instance.$style.black // own style
      const classList = className.split(' ')
      expect(classList[0]).toMatch(regexToMatchA)
      expect(classList[1]).toMatch(regexToMatchB)

      let style = [].slice
        .call(window.document.querySelectorAll('style'))
        .map((style: any) => {
          return style!.textContent
        })
        .join('\n')
      style = normalizeNewline(style)
      // own style, w/ font-weight
      expect(style).toContain(
        '.' + classList[0] + ' {\n  font-weight: bold;\n}'
      )
      // composed style, w/ red
      expect(style).toContain('.' + classList[1] + ' {\n  color: red;\n}')
    }

    await expectations.apply(undefined, defaultIdent)
    await expectations(
      customIdent,
      /test-fixtures-css-modules-default-extend-composes-css---black---[\w-+]{5}/,
      /test-fixtures-css-modules-red---red---[\w-+]{5}/
    )
  })
})

test.todo('experimental <style vars>')
