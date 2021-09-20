<template>
  <img class="logo" src="./logo.png">
  <div>
    {{ count }}
    <span>{{ count }}</span>
    <Button foo="hello!"><span>slot</span></Button>
    <ScriptSetup/>
    <TypeScript/>
  </div>
</template>

<script>
import Button from './Button.vue'
import ScriptSetup from './ScriptSetup.vue'
import TypeScript from './TypeScript.vue'

export default {
  data() {
    return {
      count: 0,
      color: 'blue'
    }
  },
  components: {
    Button,
    ScriptSetup,
    TypeScript
  }
}
</script>

<style scoped>
.logo {
  width: 100px;
  border: 1px solid v-bind(color);
}
</style>
