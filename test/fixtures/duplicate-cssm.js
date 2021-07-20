import { createApp } from 'vue'

import values from './duplicate-cssm.css'
import Component from './duplicate-cssm.vue'

if (typeof window !== 'undefined') {
  window.componentModule = Component

  const app = createApp(Component)
  const container = window.document.createElement('div')
  window.instance = app.mount(container)
}

export { values }
export default Component

window.exports = values
