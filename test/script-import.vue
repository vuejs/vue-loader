<script src="./fixtures/script-import.js"></script>

<script test>
var module = window.vueTestComp
describe("vue-loader", function () {
  it('script import', function () {
    expect(module.data().msg).to.contain('Hello from Component A!')
  })
})
</script>
