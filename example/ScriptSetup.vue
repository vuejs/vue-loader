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

ref: count = 100

function inc() {
  count++
}

const hello = 'hi from scriptttt'

const color = ref('red')
const changeColor = () => {
  color.value = color.value === 'red' ? 'green' : 'red'
}
</script>

<style>
h2 {
  color: v-bind(color);
}
</style>
