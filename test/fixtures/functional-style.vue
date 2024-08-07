<script>
import {h} from 'vue';
export default {
  functional: true,
  render () {
    return h('div', { class: 'foo' }, ['functional'])
  }
}
</script>

<style>
.foo { color: red; }
</style>
