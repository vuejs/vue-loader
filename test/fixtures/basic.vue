<style>
comp-a h2 {
  color: #f00;
}
</style>

<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
module.exports = {
  data: function () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>
