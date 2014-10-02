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
  var output = ''

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
  if (style) {
    style = cssMinifier.minify(style)
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
    output += 'require("insert-css")("' + style + '");\n'
  }

  // template
  if (template) {
    template = htmlMinifier.minify(template)
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
    output += 'var __vue_template__ = "' + template + '";\n'
  }

  // js
  if (script) {
    output += script + '\n'
  }

  output += 'module.exports.template = __vue_template__;'
  return output
}