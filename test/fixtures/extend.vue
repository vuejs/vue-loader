<template>
  <div>{{ msg }}</div>
</template>

<script>
import Vue from 'vue'

Vue.config.productionTip = false

export default Vue.extend({
  data () {
    return { msg: 'success' }
  }
})
</script>
