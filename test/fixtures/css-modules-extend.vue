<style module>
.red {
  color: #FF0000;
}
</style>

<script>
import CssModuleSimple from './css-modules-simple.vue'

export default {
  extends: CssModuleSimple
}
</script>

<template>
  <div :class="$style.red"></div>
</template>