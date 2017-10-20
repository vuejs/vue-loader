// utility for generating a uid for each component file
// used in scoped CSS rewriting
const cache = Object.create(null)
const crypto = require('crypto')
const fs = require('fs')

function createHash (file, algorithm, encoding, maxlen, salt) {
  const hash = crypto.createHash(algorithm)
  const contents = fs.readFileSync(file)
  hash.update(salt)
  hash.update(contents)
  return hash.digest(encoding).toLowerCase().trim().substring(0, maxlen)
}

module.exports = function genId (file, key = '') {
  if (!cache[file]) { cache[file] = Object.create(null) }
  return cache[file][key] || (cache[file][key] = createHash(file, 'sha256', 'hex', 8, key))
}
