var parse5 = require('parse5')
var parser = new parse5.Parser(null, { locationInfo: true })

module.exports = function (content) {
  this.cacheable()
  var cb = this.async()
  var output = {
    template: [],
    style: [],
    script: [],
    styleImports: []
  }

  var fragment = parser.parseFragment(content)

  fragment.childNodes.forEach(function (node) {
    var type = node.tagName
    var lang = getAttribute(node, 'lang')
    var src = getAttribute(node, 'src')
    var scoped = getAttribute(node, 'scoped') != null

    if (src) {
      if (type !== 'style') {
        return cb(new Error(
          '[vue-loader] src import is only supported for <style> tags.'
        ))
      }
      output.styleImports.push({
        src: src,
        lang: lang,
        scoped: scoped
      })
      return
    }

    if (!node.childNodes || !node.childNodes.length) {
      return
    }

    if (!output[type]) {
      return
    }

    if (
      (type === 'script' || type === 'template') &&
      output[type].length > 0
    ) {
      return cb(new Error(
        '[vue-loader] Only one <script> or <template> tag is ' +
        'allowed inside a Vue component.'
      ))
    }

    // Work around changes in parse5 >= 1.2.0
    if (node.childNodes[0].nodeName === '#document-fragment') {
      node = node.childNodes[0]
      if (!node.childNodes.length) {
        return
      }
    }

    var start = node.childNodes[0].__location.start
    var end = node.childNodes[node.childNodes.length - 1].__location.end
    output[type].push({
      lang: lang,
      scoped: scoped,
      content: content.substring(start, end).trim()
    })
  })

  cb(null, 'module.exports = ' + JSON.stringify(output))
}

function getAttribute (node, name) {
  if (node.attrs) {
    var i = node.attrs.length
    var attr
    while (i--) {
      attr = node.attrs[i]
      if (attr.name === name) {
        return attr.value
      }
    }
  }
}
