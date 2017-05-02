<script>
export default {
  functional: true,
  render (h) {
    return h('div', { class: 'foo' }, ['functional'])
  }
}
</script>

<style>
.foo { color: red; }
</style>
