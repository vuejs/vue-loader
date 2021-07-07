import { createApp } from 'vue'

import Component from './basic.vue'

if (typeof window !== 'undefined') {
  const container = window.document.getElementById('#app')
  const shadowRoot = container.attachShadow({ mode: 'open' })

  Component.shadowRoot = shadowRoot

  const app = createApp(Component)
  window.instance = app.mount(shadowRoot)
}

export default Component
