<style module="style">
.red {
  color: red;
}
@keyframes fade {
  from { opacity: 1; } to { opacity: 0; }
}
.animate {
  animation: fade 1s;
}
</style>

<template>
  <h2 class="style.red"></h2>
  <h3 class="{{ ['style.red'] }}"></h3>
  <h4 v-bind:class="['style.red']"></h4>
  <h5 :class="['style.red', { 'style.red': isRed }, blue]"></h5>
</template>

<script>
module.exports = {
  loader: {
    styles: '$styles'
  }
}
</script>
