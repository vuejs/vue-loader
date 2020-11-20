<template>
  <h2>{{ hello }}</h2>
  <div>
    {{ count }} <button @click="inc">+</button>
    <button @click="changeColor">change color</button>
    <Button />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from './Button.vue'

const count = ref(0)

function inc() {
  count.value++
}

const hello = 'hi from script'

const color = ref('cyan')
const changeColor = () => {
  color.value = color.value === 'red' ? 'green' : 'red'
}
</script>

<style>
h2 {
  color: v-bind(color);
}
</style>
