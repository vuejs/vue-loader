// vue compiler module for transforming `img:srcset` to a number of `require`s

module.exports = () => ({
  postTransformNode: node => {
    transform(node)
  }
})

function transform (node) {
  const tags = ['img', 'source']

  if (tags.indexOf(node.tag) !== -1 && node.attrs) {
    node.attrs.forEach(attr => {
      if (attr.name === 'srcset') {
        // same logic as in transform-require.js
        const value = attr.value
        const isStatic = value.charAt(0) === '"' && value.charAt(value.length - 1) === '"'
        if (!isStatic) {
          return
        }

        // http://w3c.github.io/html/semantics-embedded-content.html#ref-for-image-candidate-string-5
        const escapedSpaceCharacters = /( |\\t|\\n|\\f|\\r)+/g

        const imageCandidates = value.substr(1, value.length - 2).split(',').map(s => {
          // The attribute value arrives here with all whitespace, except normal spaces, represented by escape sequences
          const [url, descriptor] = s.replace(escapedSpaceCharacters, ' ').trim().split(' ', 2)
          return { require: urlToRequire(url), descriptor: descriptor }
        })

        let code = ''
        imageCandidates.forEach((o, i, a) => {
          code += o.require + ' + " ' + o.descriptor + (i < a.length - 1 ? ', " + ' : '"')
        })

        attr.value = code
      }
    })
  }
}

function urlToRequire (url) {
  // same logic as in transform-require.js
  const firstChar = url.charAt(0)
  if (firstChar === '.' || firstChar === '~') {
    if (firstChar === '~') {
      const secondChar = url.charAt(1)
      url = url.slice(secondChar === '/' ? 2 : 1)
    }
    return `require("${url}")`
  } else {
    return `"${url}"`
  }
}
