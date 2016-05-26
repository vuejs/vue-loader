<style>
body {
  transform: scale(1);
}
</style>
<script test>
var styles = window.document.querySelectorAll('style')
var style = styles[styles.length-1].textContent
describe("vue-loader", function () {
  it('autoprefix', function () {
    expect(style).to.contain('body {\n  -webkit-transform: scale(1);\n          transform: scale(1);\n}')
  })
})
</script>
