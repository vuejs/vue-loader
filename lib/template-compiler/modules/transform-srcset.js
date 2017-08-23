// vue compiler module for transforming `img:srcset` to a number of `require`s

module.exports = function () {
  return {
    postTransformNode: node => {
      transform(node)
    }
  }
}

function transform (node) {
  if (node.tag === 'img' && node.attrs) {
    node.attrs.forEach(attr => {
      if (attr.name === 'srcset') {
        // same logic as in transform-require.js
        var value = attr.value
        var isStatic = value.charAt(0) === '"' && value.charAt(value.length - 1) === '"'
        if (!isStatic) {
          return
        }

        // http://w3c.github.io/html/semantics-embedded-content.html#ref-for-image-candidate-string-5

        const spaceCharacters = /[ \t\n\f\r]+/

        const imageCandidates = value.substr(1, value.length - 2).split(',').map(s => {
          const [url, descriptor] = s.trim().split(spaceCharacters, 2)
          return { require: urlToRequire(url), descriptor: descriptor }
        })

        let code = ''
        imageCandidates.forEach((o, i, a) => {
          code += o.require + ' + " ' + o.descriptor + (i < a.length - 1 ? ',' : '') + '"'
        })

        attr.value = code
      }
    })
  }
}

function urlToRequire (url) {
	// same logic as in transform-require.js
  var firstChar = url.charAt(0)
  if (firstChar === '.' || firstChar === '~') {
    if (firstChar === '~') {
      var secondChar = url.charAt(1)
      url = '"' + url.slice(secondChar === '/' ? 2 : 1)
    }
    return 'require("' + url + '")'
  }
}
