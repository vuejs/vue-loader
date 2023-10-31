<template>
  <div class="text">hello</div>
</template>

<script>
export default {
  data() {
    return {
      color: 'red',
      font: {
        size: '2em',
      },
    }
  },
}
</script>

<style>
.text {
  color: v-bind(color);

  /* expressions (wrap in quotes) */
  font-size: v-bind('font.size');
}
</style>
