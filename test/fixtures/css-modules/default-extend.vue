<style module>
.red {
  color: #FF0000;
}
</style>

<script>
import CssModuleSimple from './default.vue'

export default {
  extends: CssModuleSimple
}
</script>

<template>
  <div>{{ $style.red }}</div>
</template>
