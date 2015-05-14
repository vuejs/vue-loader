var parse5 = require('parse5');
var parser = new parse5.Parser(null, { locationInfo: true });
var serializer = new parse5.TreeSerializer();
var SourceNode = require("source-map").SourceNode;
var loaderUtils = require("loader-utils");

module.exports = function (content) {
  this.cacheable();
  var cb = this.async();
  var vueRequest = loaderUtils.getRemainingRequest(this);
  var request = loaderUtils.getCurrentRequest(this);

  var languages = {};
  var output = {
    template: {},
    style: {},
    script: {},
    includes: []
  };

  function pos(offset) {
    return {
      line: content.substr(0, offset).split('\n').length,
      col: offset - content.lastIndexOf('\n', offset - 1)
    }
  }

  var fragment = parser.parseFragment(content);
  fragment.childNodes.forEach(function (node) {
    var type = node.nodeName;
    if (type == '#text')
      return;
    if (checkSrc(node, output.includes))
      return;

    var lang = checkLang(node) || '';

    // Work around changes in parse5 >= 1.2.0
    var childNode = node.childNodes[0];
    if (childNode && childNode.nodeName === '#document-fragment') {
      node = childNode;
    }

    if (!node.childNodes.length)
      return;

    var start = node.childNodes[0].__location.start;
    var end = node.childNodes[node.childNodes.length - 1].__location.end;
    var lines = content.substring(start, end).split('\n');
    var startPos = pos(start);
    var sourceNodes = lines.map(function (line, i) {
      return new SourceNode(startPos.line + i, i ? 0 : startPos.col, vueRequest, line + '\n');
    });
    output[type][lang] = (output[type][lang] || []).concat(sourceNodes)
  });

  for (var type in output) {
    for (var lang in output[type]) {
      var sourceNodes = output[type][lang];
      output[type][lang] = new SourceNode(1, 1, vueRequest, sourceNodes).toStringWithSourceMap({
        file: request
      })
    }
  }

  cb(null, 'module.exports = ' + JSON.stringify(output));
}

function checkLang (node) {
  if (node.attrs) {
    var i = node.attrs.length;
    while (i--) {
      var attr = node.attrs[i];
      if (attr.name === 'lang') {
        return attr.value;
      }
    }
  }
}

function checkSrc (node, arr) {
  if (node.attrs) {
    var i = node.attrs.length;
    while (i--) {
      var attr = node.attrs[i];
      if (attr.name === 'src') {
        arr.push(attr.value);
        return true;
      }
    }
  }
  return false
}
