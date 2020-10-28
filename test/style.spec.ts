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

test.todo('CSS Modules')

test.todo('CSS Modules Extend')

test.todo('experimental <style vars>')
