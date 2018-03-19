import Vue from 'vue'
import App from './ssr-style.vue'

export default () => new Vue({
  render: h => h(App)
})
