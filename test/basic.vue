<script>
module.exports = {
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>
<template>
  <h2 class="red">{{msg}}</h2>
</template>

<style>
comp-a h2 {
  color: #f00;
}
</style>

<script test>
var module = window.vueTestComp
var styles = window.document.querySelectorAll('style')
var style = styles[styles.length-1].textContent
describe("vue-loader", function () {
  it('basic', function () {
    expect(module.template).to.contain('<h2 class="red">{{msg}}</h2>')
    expect(module.data().msg).to.contain('Hello from Component A!')
    expect(style).to.contain('comp-a h2 {\n  color: #f00;\n}')
  })
})
</script>
