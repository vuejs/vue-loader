import { mockBundleAndRun } from './utils'

test('named exports', async () => {
  const { exports } = await mockBundleAndRun({
    entry: 'named-exports.vue',
  })
  expect(exports.default.name).toBe('named-exports')
  expect(exports.foo()).toBe(1)
})

test('experimental <script setup>', async () => {
  await mockBundleAndRun({ entry: 'ScriptSetup.vue' })
})

test('should handle custom resource query', async () => {
  const { exports } = await mockBundleAndRun({
    entry: 'custom-query.vue',
  })

  expect(exports.default.data().msg).toBe('Hello from Component A!')
})
