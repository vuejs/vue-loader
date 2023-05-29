<style module>
.black {
  color: #000000;
}
</style>

<script>
import CssModuleSimple from './default.vue'

export default {
  extends: CssModuleSimple
}
</script>

<template>
  <div>{{ $style.red }} | {{ $style.black }}</div>
</template>
