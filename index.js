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
        var lang = checkLang(node)
        if (lang === 'stylus') {
          style = require('./compilers/stylus')(style)
        } else if (lang === 'less') {
          style = require('./compilers/less')(style)
        } else if (lang === 'sass' || lang === 'scss') {
          style = require('./compilers/sass')(style)
        }
        break
      case 'template':
        template = serializer.serialize(node)
        if (checkLang(node) === 'jade') {
          template = require('./compilers/jade')(template)
        }
        break
      case 'script':
        script = serializer.serialize(node)
        if (checkLang(node) === 'coffee') {
          script = require('./compilers/coffee')(script)
        }
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

function checkLang (node) {
  if (node.attrs) {
    var i = node.attrs.length
    while (i--) {
      var attr = node.attrs[i]
      if (attr.name === 'lang') {
        return attr.value
      }
    }
  }
}