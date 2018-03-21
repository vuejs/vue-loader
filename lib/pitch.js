const qs = require('querystring')
const loaderUtils = require('loader-utils')
const templateLoaderPath = require.resolve('./templateLoader')
const stylePostLoaderPath = require.resolve('./style-post-loader')

module.exports = code => code

// This pitching loader is responsible for intercepting all vue block requests
// and transform it into appropriate requests.
module.exports.pitch = function (remainingRequest) {
  const query = qs.parse(this.resourceQuery.slice(1))

  if (query.vue == null) {
    return
  }

  const loaders = this.loaders.slice(1) // remove self

  // loader.request contains both the resolved loader path and its options
  // query (e.g. ??ref-0)
  const toLoaderString = loader => loader.request

  const genRequest = loaderStrings => {
    // important: dedupe
    loaderStrings = Array.from(new Set(loaderStrings))
    return loaderUtils.stringifyRequest(this, '-!' + [
      ...loaderStrings,
      this.resourcePath + this.resourceQuery
    ].join('!'))
  }

  // Inject style-post-loader before css-loader for scoped CSS and trimming
  if (query.type === `style`) {
    const cssLoaderIndex = loaders.findIndex(l => /\/css-loader/.test(l.request))
    if (cssLoaderIndex) {
      const afterLoaders = loaders.slice(0, cssLoaderIndex + 1).map(toLoaderString)
      const beforeLoaders = loaders.slice(cssLoaderIndex + 1).map(toLoaderString)
      const request = genRequest([
        ...afterLoaders,
        stylePostLoaderPath,
        ...beforeLoaders
      ])
      // use cjs to ensure exports from (vue-)style-loader/css-loader are intact
      return `module.exports = require(${request})`
    }
  }

  // for templates: inject the template compiler
  if (query.type === `template`) {
    const beforeLoaders = loaders.map(toLoaderString)
    const request = genRequest([
      templateLoaderPath + `??vue-loader-options`,
      ...beforeLoaders
    ])
    // the template compiler uses esm exports
    return `export * from ${request}`
  }

  // When the user defines a rule that has only resourceQuery but no test,
  // both that rule and the cloned rule will match, resulting in duplicated
  // loaders. Therefore it is necessary to perform a dedupe here.
  const dedupedRequest = genRequest(loaders.map(toLoaderString))
  return `module.exports = require(${dedupedRequest})`
}
