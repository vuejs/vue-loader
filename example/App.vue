<template>
  <img class="logo" src="./logo.png">
  <div>
    {{ count }}
    <span>{{ count }}</span>
    <Button><span>slot</span></Button>
  </div>
</template>

<script>
import Button from './Button.vue'

export default {
  data() {
    return { count: 0 }
  },
  components: {
    Button
  }
}
</script>

<style scoped>
.logo {
  width: 100px;
  border: 1px solid red;
}
</style>
