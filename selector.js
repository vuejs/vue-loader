module.exports = function () {
  this.cacheable()
  var cb = this.async()
  var path = this.query.substr(1).split('/')

  var self = this
  var url = "!!" + require.resolve("./parser.js") + "!" + this.resource
  this.loadModule(url, function(err, source) {
    if (err) return cb(err)
    var parts = self.exec(source, url)
    var part = parts[path[0]][path[1]||'']
    cb(null, part.code, part.map)
  })
}
