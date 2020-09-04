<template>
  <h2>{{ hello }}</h2>
  <div>
    {{ count }} <button @click="inc">+</button>
    <Button/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
export { default as Button } from './Button.vue'

export const count = ref(0)

export function inc() {
  count.value++
}

export const hello = 'hi from script setup'
</script>
