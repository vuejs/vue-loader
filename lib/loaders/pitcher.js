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
  if (loaders.some(l => /(\/|\\|@)null-loader/.test(l.path))) {
    return
  }

  const genRequest = loaders => {
    // Important: dedupe since both the original rule
    // and the cloned rule would match a source import request.
    // also make sure to dedupe based on loader path.
    // assumes you'd probably never want to apply the same loader on the same
    // file twice.
    const seen = new Map()
    const loaderStrings = []

    loaders.forEach(loader => {
      const type = typeof loader === 'string' ? loader : loader.path
      const request = typeof loader === 'string' ? loader : loader.request
      if (!seen.has(type)) {
        seen.set(type, true)
        // loader.request contains both the resolved loader path and its options
        // query (e.g. ??ref-0)
        loaderStrings.push(request)
      }
    })

    return loaderUtils.stringifyRequest(this, '-!' + [
      ...loaderStrings,
      this.resourcePath + this.resourceQuery
    ].join('!'))
  }

  // Inject style-post-loader before css-loader for scoped CSS and trimming
  if (query.type === `style`) {
    const cssLoaderIndex = loaders.findIndex(l => /(\/|\\|@)css-loader/.test(l.path))
    if (cssLoaderIndex > -1) {
      const afterLoaders = loaders.slice(0, cssLoaderIndex + 1)
      const beforeLoaders = loaders.slice(cssLoaderIndex + 1)
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
    const request = genRequest([
      templateLoaderPath + `??vue-loader-options`,
      ...loaders
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
  const request = genRequest(loaders)
  return `import mod from ${request}; export default mod; export * from ${request}`
}
