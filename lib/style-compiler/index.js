const postcss = require('postcss')
const loaderUtils = require('loader-utils')
const loadPostcssConfig = require('./load-postcss-config')

const trim = require('./plugins/trim')
const scopeId = require('./plugins/scope-id')

module.exports = function (css, map) {
  this.cacheable()
  const cb = this.async()
  const loaderOptions = loaderUtils.getOptions(this) || {}
  const inlineConfig = (this._compilation.__vueOptions__ || {}).postcss

  loadPostcssConfig(this, inlineConfig)
    .then(config => {
      const plugins = config.plugins.concat(trim)
      const options = Object.assign(
        {
          to: this.resourcePath,
          from: this.resourcePath,
          map: false
        },
        config.options
      )

      // add plugin for vue-loader scoped css rewrite
      if (loaderOptions.scoped) {
        plugins.push(scopeId({ id: loaderOptions.id }))
      }

      // source map
      if (loaderOptions.sourceMap && !options.map) {
        options.map = {
          inline: false,
          annotation: false,
          prev: map
        }
      }

      return postcss(plugins)
        .process(css, options)
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
    })
    .catch(e => {
      console.error(e)
      cb(e)
    })
}
