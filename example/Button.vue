<template>
  <button @click="inc">{{ count }}</button>
  <slot/>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return {
      count,
      inc: () => { count.value++ }
    }
  }
}
</script>

<style scoped>
::v-slotted(*) {
  color: green;
}
</style>

<docs>
This component is fire. // <-- this should be logged
</docs>
