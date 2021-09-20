<script setup>
import { ref } from 'vue'
import Button from './Button.vue'

let count = $ref(100)

function inc() {
  count++
}

const hello = 'hi from scriptttt'

const color = ref('red')
const changeColor = () => {
  color.value = color.value === 'red' ? 'green' : 'red'
}
</script>

<template>
  <h2>{{ hello }}</h2>
  <div>
    ref sugar count: {{ count }} <button @click="inc">+</button>
    <button @click="changeColor">change color</button>
    <Button />
  </div>
</template>

<style>
h2 {
  color: v-bind(color);
}
</style>
