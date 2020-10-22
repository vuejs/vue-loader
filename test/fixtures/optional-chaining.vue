<template>
  <div :class="{ [`test-${obj?.a}`]: true, b }"></div>
</template>

<script>
export default {
  data () {
    return {
      obj: {
        a: 'hello'
      },
      b: true
    }
  }
}
</script>
