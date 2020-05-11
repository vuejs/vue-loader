import { bundle } from './utils'

test('basic', async () => {
  await bundle({ entry: 'basic.vue' })
})
