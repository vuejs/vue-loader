<template>
  <h2>{{ hello }}</h2>
  <div>
    {{ count }} <button @click="inc">+</button>
    <button @click="changeColor">change color</button>
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

export const color = ref('red')
export const changeColor = () => {
  color.value = color.value === 'red' ? 'green' : 'red'
}
</script>

<style scoped vars="{ color }">
h2 {
  color: var(--color)
}
</style>
