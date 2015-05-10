module.exports = function () {
  this.cacheable();
  var cb = this.async();
  var path = this.query.substr(1).split('/');

  var me = this;
  var url = "!!" + require.resolve("./parser.js") + "!" + this.resource;
  this.loadModule(url, function(err, source) {
    if (err) return cb(err);
    var parts = me.exec(source, url);
    cb(null, parts[path[0]][path[1]]);
  })
}
