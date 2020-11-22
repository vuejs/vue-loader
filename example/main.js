import App from './App.vue'
import { createApp, createSSRApp } from 'vue'

const app = __IS_SSR__ ? createSSRApp(App) : createApp(App)
export default app

if (typeof window !== 'undefined') {
  app.mount('#app')
}
