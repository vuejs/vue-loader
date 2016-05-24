<style lang="stylus">
font-stack = Helvetica, sans-serif
primary-color = #999
body
  font 100% font-stack
  color primary-color
</style>

<template lang="jade">
h1 This is the app
comp-a
comp-b
</template>

<script lang="coffee">
module.exports =
  data: ->
    msg: 'Hello from coffee!'
</script>

<script test>
var module = window.vueTestComp
var styles = window.document.querySelectorAll('style')
var style = styles[styles.length-1].textContent
describe("vue-loader", function () {
  it('preprocessors', function () {
    expect(module.template).to.contain(
      '<h1>This is the app</h1>' +
      '<comp-a></comp-a>' +
      '<comp-b></comp-b>'
    )
    expect(module.data().msg).to.contain('Hello from coffee!')
    expect(style).to.contain('body {\n  font: 100% Helvetica, sans-serif;\n  color: #999;\n}')
  })
})
</script>
