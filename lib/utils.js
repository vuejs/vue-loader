const qs = require('querystring')

// transform the attrs on a SFC block descriptor into a resourceQuery string
exports.attrsToQuery = (attrs, langFallback) => {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (name !== 'src') {
      query += `&${qs.escape(name)}=${value ? qs.escape(value) : ``}`
    }
  }
  if (langFallback && !(`lang` in attrs)) {
    query += `&lang=${langFallback}`
  }
  return query
}
