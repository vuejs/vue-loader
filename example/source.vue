<template lang="pug">
div(ok)
  h1(:class="$style.red") hello
  p() {{msg}}

  <ExtraJs></ExtraJs>
</template>

<script>

export default {
  data () {
    return {
      msg: 'fesfff'
    }
  }

}
</script>

<style module>
.red {
  color: red;
}
</style>

<foo>
export default comp => {
  console.log(comp.options.data())
}
</foo>
