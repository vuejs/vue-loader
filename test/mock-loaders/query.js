module.exports = function (content) {
  const query = this.resourceQuery.slice(1)

  if (/change/.test(query)) {
    return `
      <template>
        <div>Changed!</div>
      </template>
      <script>
      export default {
        data () {
          return {
            msg: 'Changed!'
          }
        }
      }
      </script>
    `
  }

  return content
}
