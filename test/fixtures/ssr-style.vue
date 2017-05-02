<template>
  <div>
    <h1>Hello</h1>
    <basic/>
    <functional-style/>
  </div>
</template>

<script>
import Basic from './basic.vue'
import FunctionalStyle from './functional-style.vue'

export default {
  components: {
    Basic,
    FunctionalStyle
  }
}
</script>

<style>
h1 { color: green; }
</style>

<style src="./style-import.css"></style>
