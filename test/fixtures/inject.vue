<template>
  <div class="msg">{{ msg }}</div>
</template>

<script>
const SomeService = require('./service')

module.exports = {
  data () {
    return {
      msg: SomeService.msg
    }
  }
}
</script>
