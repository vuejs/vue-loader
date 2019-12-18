module.exports = function(source) {
  this.callback(null, `export default function (Comp) {
    Comp.mounted = () => console.log(${JSON.stringify(source.trim())})
  }`)
}
