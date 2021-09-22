import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import Component from './i18n.vue'
import * as exports from './i18n.vue'

const i18n = createI18n({
  locale: 'de',
  silentFallbackWarn: true,
  silentTranslationWarn: true,
})

if (typeof window !== 'undefined') {
  window.componentModule = Component
  window.exports = exports

  const app = createApp(Component).use(i18n)

  const container = window.document.createElement('div')
  window.instance = app.mount(container)
}

export default Component
