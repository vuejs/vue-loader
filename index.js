var loaderUtils = require("loader-utils");

module.exports = function (content) {
  this.cacheable();
  var cb = this.async();
  var languages = {};
  var output = '';
  var vueUrl = loaderUtils.getRemainingRequest(this);
  var loaders = {
    html: 'html',
    css: 'style!css',
    js: ''
  };
  var loaderPrefix = {
    template: '',
    style: 'style!css!',
    script: ''
  };
  var defaultLang = {
    template: 'html',
    style: 'css',
    script: 'js'
  };

  function loader(part, lang) {
    lang = lang || defaultLang[part];
    var loader = loaders[lang] !== undefined ? loaders[lang] : loaderPrefix[part] + lang;
    return loader ? loader + '!' : '';
  }

  var me = this;
  function getRequire(part, lang) {
    return 'require(' + loaderUtils.stringifyRequest(me, '-!' + loader(part, lang) + require.resolve('./selector.js') + '?' + part + '/' + lang + '!' + vueUrl) + ')';
  }

  var me = this;
  var url = "!!" + require.resolve("./parser.js") + "!" + vueUrl;
  this.loadModule(url, function(err, source, map, module) {
    if (err) return cb(err);

    var parts = me.exec(source, url);

    for (var i = 0; i < parts.includes.length; i++)
      output += 'require(' + loaderUtils.stringifyRequest(this, loaderUtils.urlToRequest(parts.includes[i])) + ')\n';

    for (var lang in parts.style)
      output += getRequire('style', lang) + '\n';

    for (var lang in parts.script)
      output += 'module.exports = ' + getRequire('script', lang) + '\n';

    var hasTemplate = false;
    for (var lang in parts.template) {
      if (hasTemplate)
        return cb(new Error('Only one template element allowed per vue component!'));
      output += 'module.exports.template = ' + getRequire('template', lang);
      output += '\nif (module.exports.template instanceof Function) module.exports.template = module.exports.template({})';
      hasTemplate = true;
    }

    cb(null, output);
  })
}
