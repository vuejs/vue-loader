var loaderUtils = require('loader-utils')

module.exports = function () {
  this.cacheable()
  var cb = this.async()
  var query = loaderUtils.parseQuery(this.query)

  var self = this
  var url = '!!' + require.resolve('./parser.js') + '!' + this.resource
  this.loadModule(url, function (err, source) {
    if (err) return cb(err)
    var parts = self.exec(source, url)
    cb(null, parts[query.type][query.index].content)
  })
}
