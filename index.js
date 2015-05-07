module.exports = function (content) {
  this.cacheable();
  var cb = this.async();
  var languages = {}
  var output = ''
  var vueUrl = this.resource;
  var loaders = {}
  var loaderPrefix = {
    template: 'html!',
    style: 'style!css!',
    script: ''
  }

  function loader(part, lang) {
    var loader = loaders[lang] || loaderPrefix[part] + lang;
    return loader ? loader + '!' : ''
  }

  function getRequire(part, lang) {
    return 'require(' + JSON.stringify('-!' + loader(part, lang) + require.resolve('./selector.js') + '?' + part + '/' + lang + '!' + vueUrl) + ')';
  }

  var me = this;
  var url = "!!" + require.resolve("./parser.js") + "!" + vueUrl;
  this.loadModule(url, function(err, source, map, module) {
    if (err) return cb(err);

    var parts = me.exec(source, url);

    for (var lang in parts.style)
      output += getRequire('style', lang) + '\n'

    for (var lang in parts.script)
      output += 'module.exports = ' + getRequire('script', lang) + '\n'

    var hasTemplate = false;
    for (var lang in parts.template) {
      if (hasTemplate)
        return cb(new Error('Only one template element allowed per vue component!'))
      output += 'module.exports.template = ' + getRequire('template', lang);
      hasTemplate = true;
    }

    cb(null, output);
  })
}
