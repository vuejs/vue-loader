<template lang="jade" src="./fixtures/template-import.jade"></template>

<script test>
var module = window.vueTestComp
describe("vue-loader", function () {
  it('template import', function () {
    expect(module.template).to.contain('<div><h1>hello</h1></div>')
  })
})
</script>
