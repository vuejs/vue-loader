const qs = require('querystring')
const loaderUtils = require('loader-utils')
const selfPath = require.resolve('../index')
const templateLoaderPath = require.resolve('./templateLoader')
const stylePostLoaderPath = require.resolve('./stylePostLoader')

module.exports = code => code

// This pitching loader is responsible for intercepting all vue block requests
// and transform it into appropriate requests.
module.exports.pitch = function (remainingRequest) {
  const query = qs.parse(this.resourceQuery.slice(1))
  const loaders = this.loaders.slice(1) // remove self

  // do not inject if user uses null-loader to void the type (#1239)
  if (loaders.some(l => /(\/|\\)null-loader/.test(l.path))) {
    return
  }

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
    const cssLoaderIndex = loaders.findIndex(l => /(\/|\\)css-loader/.test(l.path))
    if (cssLoaderIndex) {
      const afterLoaders = loaders.slice(0, cssLoaderIndex + 1).map(toLoaderString)
      const beforeLoaders = loaders.slice(cssLoaderIndex + 1).map(toLoaderString)
      const request = genRequest([
        ...afterLoaders,
        stylePostLoaderPath,
        ...beforeLoaders
      ])
      // console.log(request)
      return `import mod from ${request}; export default mod; export * from ${request}`
    }
  }

  // for templates: inject the template compiler
  if (query.type === `template`) {
    const beforeLoaders = loaders.map(toLoaderString)
    const request = genRequest([
      templateLoaderPath + `??vue-loader-options`,
      ...beforeLoaders
    ])
    // console.log(request)
    // the template compiler uses esm exports
    return `export * from ${request}`
  }

  // if a custom block has no other matching loader other than vue-loader itself,
  // we should ignore it
  if (query.type === `custom` &&
      loaders.length === 1 &&
      loaders[0].path === selfPath) {
    return ``
  }

  // When the user defines a rule that has only resourceQuery but no test,
  // both that rule and the cloned rule will match, resulting in duplicated
  // loaders. Therefore it is necessary to perform a dedupe here.
  const request = genRequest(loaders.map(toLoaderString))
  return `import mod from ${request}; export default mod; export * from ${request}`
}
