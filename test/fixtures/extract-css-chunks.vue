<template>
  <div>
    <basic></basic>
    <empty-style></empty-style>
  </div>
</template>

<script>
export default {
  components: {
    Basic: () => import(/* webpackChunkName: "basic" */ './basic.vue'),
    EmptyStyle: () => import(/* webpackChunkName: "empty" */ './empty-style.vue')
  }
}
</script>

<style>
h1 {
  color: red;
}
</style>
