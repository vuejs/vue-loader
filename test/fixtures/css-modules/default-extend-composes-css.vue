<style module>
.black {
  composes: red from './red.css';
  font-weight: bold;
}
</style>

<script>
/* composes directly import a class in style */
export default {
}
</script>

<template>
  <div>{{ $style.black }}</div>
</template>
