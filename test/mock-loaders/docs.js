module.exports = function (source, map) {
  this.callback(
    null,
    `export default Component => {
      Component.__docs = ${JSON.stringify(source)}
    }`,
    map
  )
}
