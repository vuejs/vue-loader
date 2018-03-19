const qs = require('querystring')
const postcss = require('postcss')
const trim = require('./plugins/trim')
const scoped = require('./plugins/scoped')

// This is a post loader that handles scoped CSS transforms.
// Injected right before css-loader by the global pitcher (../pitch.js)
// for any <style scoped> selection requests initiated from within vue files.
module.exports = function (source, map) {
  const cb = this.async()

  const query = qs.parse(this.resourceQuery.slice(1))
  const id = `data-v-${query.id}`
  const plugins = [trim(), scoped({ id })]

  const options = {
    to: this.resourcePath,
    from: this.resourcePath,
    map: false
  }
  if (map) {
    options.map = {
      inline: false,
      annotation: false,
      prev: map
    }
  }

  postcss(plugins)
    .process(source, options)
    .then(result => {
      if (result.messages) {
        result.messages.forEach(({ type, file }) => {
          if (type === 'dependency') {
            this.addDependency(file)
          }
        })
      }
      const map = result.map && result.map.toJSON()
      cb(null, result.css, map)
      return null // silence bluebird warning
    })
    .catch(cb)
}
