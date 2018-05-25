const qs = require('querystring')

// these are built-in query parameters so should be ignored
// if the user happen to add them as attrs
const ignoreList = [
  'id',
  'index',
  'src',
  'type'
]

// transform the attrs on a SFC block descriptor into a resourceQuery string
exports.attrsToQuery = (attrs, langFallback) => {
  let query = ``
  const keys = []

  for (const name in attrs) {
    const key = name.replace(/^:/, '')
    const value = attrs[name]
    if (!ignoreList.includes(key)) {
      keys.push(key)
      query += `&${qs.escape(key)}=${value ? qs.escape(value) : ``}`
    }
  }
  if (langFallback && keys.indexOf('lang') === -1) {
    query += `&lang=${langFallback}`
  }
  return query
}
