<template>
  <h2>{{msg}}</h2>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello from themed styled Component!'
    }
  }
}
</script>

<style scoped>
h2 {
  color: cyan;
}
</style>

<style scoped keep>
h2 {
  color: orange;
}
</style>
