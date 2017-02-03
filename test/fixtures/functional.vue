<template functional>
  <div>
    <h2 class="red">{{ props.msg }}</h2>
    <slot></slot>
    <slot name="slot2"></slot>
    <slot :msg="props.msg" name="scoped"></slot>
    <div>Some <span>text</span></div>
    <div v-if="false">Not exist</div>
  </div>
</template>

<script>
export default {
  props: {
    msg: {
      type: String,
      default: 'hello'
    }
  }
}
</script>

<style>
comp-a h2 {
  color: #f00;
}
</style>
