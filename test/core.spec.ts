import { mockBundleAndRun } from './utils'

test('basic', async () => {
  const { instance } = await mockBundleAndRun({ entry: 'basic.vue' })

  // <h2 class="red">{{msg}}</h2>
  expect(instance.$el.tagName).toBe('H2')
  expect(instance.$el.className).toBe('red')
  expect(instance.$el.textContent).toBe('Hello from Component A!')
})

test('script setup', async () => {
  await mockBundleAndRun({ entry: 'ScriptSetup.vue' })
})

test('without script block', async () => {
  await mockBundleAndRun({ entry: 'no-script.vue' })
})
