<template><SubComponent></SubComponent></template>
<style src="./style-import.css"></style>
<style src="./style-import-scoped.css" scoped></style>
<script>
import SubComponent from './style-import-twice-sub.vue'
export default {
  components: { SubComponent }
}
</script>
