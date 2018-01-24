const postcss = require('postcss')
const path = require('path')

function extractUrl (str) {
  const urls = []
  const urlExpression = /(\burl\(\s*(["'])?\s*([^)?#\s'"]+)?([?#][^'"]*?)?\s*\2\s*\))/g
  const excludeExpression = /^(([a-z]+:)?\/\/|\.|\/|~)/
  while (urlExpression.test(str)) {
    const info = {
      string: RegExp.$1,
      url: RegExp.$3,
      quote: RegExp.$2 || '',
      query: RegExp.$4 || ''
    }
    if (!excludeExpression.test(info.url)) {
      urls.push(info)
    }
  }
  if (urls.length) {
    return urls
  }
  return null
}

function replaceUrl (str, info, rel) {
  return str.replace(info.string, 'url('.concat(info.quote, rel, info.query, info.quote, ')'))
}

function create (that) {
  const cache = {}

  function getAbs (filepath) {
    return new Promise(succ => {
      if (typeof cache[filepath] !== 'undefined') {
        return succ(cache[filepath])
      }
      return that.resolve(that.context, filepath, (err, res) => {
        const data = err ? null : res
        cache[filepath] = data
        return succ(data)
      })
    })
  }

  function getRel (filepath) {
    return path.relative(that.context, filepath).replace(/\\/g, '/')
  }

  function plugin (css) {
    const resolvers = []
    css.walkDecls(decl => {
      const urls = extractUrl(decl.value)
      if (urls) {
        resolvers.push(Promise.all(urls.map(info => {
          return getAbs(info.url).then(abs => {
            if (abs) {
              decl.value = replaceUrl(decl.value, info, getRel(abs))
            }
          })
        })))
      }
    })
    return Promise.all(resolvers)
  }

  return postcss.plugin('url-resolver', opts => plugin)
}

module.exports = create
