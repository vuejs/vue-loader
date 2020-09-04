import { bundle } from './utils'

test('basic', async () => {
  await bundle({ entry: 'basic.vue' })
})

test('script setup', async () => {
  await bundle({ entry: 'ScriptSetup.vue' })
})
