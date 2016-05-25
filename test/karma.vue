<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
module.exports = {
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>


<script test="karma">
var module = window.vueTestComp
describe("vue-loader", function () {
  it('karma', function () {
    expect(module.$el).to.exist
    expect(module.msg).to.contain('Hello from Component A!')
  })
  after(function () {
    module.$destroy(true)
  })
})
</script>
