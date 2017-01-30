<template>
  <div>
    <h1>Hello</h1>
    <basic/>
  </div>
</template>

<script>
import Basic from './basic.vue'

export default {
  components: { Basic }
}
</script>

<style>
h1 { color: green; }
</style>

<style src="./style-import.css"></style>
