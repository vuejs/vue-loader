var htmlMinifier = require("html-minifier")
var cssMinifier = new require('clean-css')()
var parse5 = require('parse5')
var parser = new parse5.Parser()
var serializer = new parse5.TreeSerializer()

module.exports = function (content) {
  this.cacheable && this.cacheable()

  var script
  var style
  var template
  var output

  var fragment = parser.parseFragment(content)
  fragment.childNodes.forEach(function (node) {
    switch (node.nodeName) {
      case 'style':
        style = serializer.serialize(node)
        break
      case 'template':
        template = serializer.serialize(node)
        break
      case 'script':
        script = serializer.serialize(node)
        break
    }
  })

  // style
  style = cssMinifier.minify(style).replace(/"/g, '\\"')
  output = 'require("insert-css")("' + style + '");\n'
  // template
  template = htmlMinifier.minify(template).replace(/"/g, '\\"')
  output += 'var __template__ = "' + template + '";\n'
  // js
  output += script + '\n' + 'module.exports.template = __template__;'
  return output
}