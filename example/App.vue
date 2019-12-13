<template>
  <img class="logo" src="./logo.png">
  <Button>slotttt</Button>
  <Button>slot content</Button>
  <Button>slot content</Button>
</template>

<script>
import Button from './Button.vue'

export default {
  components: {
    Button
  }
}
</script>

<style>
.logo {
  width: 100px;
  border: 1px solid red;
}
</style>
