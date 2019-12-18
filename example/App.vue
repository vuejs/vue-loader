<template>
  <img :class="$style.logo" src="./logo.png">
  <div>
    {{ count }}
    <span>{{ count }}</span>
    <Button>slotttt</Button>
  </div>
</template>

<script>
import { useCSSModule } from 'vue'
import Button from './Button.vue'

export default {
  setup() {
    const styles = useCSSModule()
    console.log('hmm')
  },
  data() {
    return { count: 0 }
  },
  components: {
    Button
  }
}
</script>

<style module>
.logo {
  width: 100px;
  border: 1px solid red;
}
</style>
