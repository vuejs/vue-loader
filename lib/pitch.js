const qs = require('querystring')
const loaderUtils = require('loader-utils')
const templateLoaderPath = require.resolve('./template-loader')
const stylePostLoaderPath = require.resolve('./style-post-loader')

module.exports = code => code

// This pitching loader is responsible for catching all src import requests
// from within vue files and transform it into appropriate requests
module.exports.pitch = function (remainingRequest) {
  const query = qs.parse(this.resourceQuery.slice(1))
  if (query.vue != null) {
    // For Scoped CSS: inject style-post-loader before css-loader
    if (query.type === `style` && query.scoped != null) {
      const cssLoaderIndex = this.loaders.findIndex(l => /\/css-loader/.test(l.request))
      if (cssLoaderIndex) {
        const afterLoaders = this.loaders.slice(1, cssLoaderIndex + 1).map(l => l.request)
        const beforeLoaders = this.loaders.slice(cssLoaderIndex + 1).map(l => l.request)
        const request = '-!' + [
          ...afterLoaders,
          stylePostLoaderPath,
          ...beforeLoaders,
          this.resourcePath + this.resourceQuery
        ].join('!')
        return `export * from ${loaderUtils.stringifyRequest(this, request)}`
      }
    }

    // for templates: inject the template compiler
    if (query.type === `template`) {
      const beforeLoaders = this.loaders.slice(1).map(l => l.request)
      const request = '-!' + [
        templateLoaderPath + `??vue-loader-options`,
        ...beforeLoaders,
        this.resourcePath + this.resourceQuery
      ].join('!')
      return `export * from ${loaderUtils.stringifyRequest(this, request)}`
    }
  }
}
