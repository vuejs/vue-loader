// resolve compilers to use.

let cached

exports.resolveCompiler = function (loaderContext) {
  if (cached) {
    return cached
  }

  const ctx = loaderContext.rootContext
  // check 2.7
  try {
    const pkg = loadFromContext('vue/package.json', ctx)
    const [major, minor] = pkg.version.split('.')
    if (major === '2' && minor === '7') {
      return (cached = {
        compiler: loadFromContext('vue/compiler-sfc', ctx),
        templateCompiler: undefined
      })
    }
  } catch (e) {}

  return (cached = {
    compiler: require('@vue/component-compiler-utils'),
    templateCompiler: loadTemplateCompiler(loaderContext)
  })
}

function loadFromContext (path, ctx) {
  return require(require.resolve(path, {
    paths: [ctx]
  }))
}

function loadTemplateCompiler (loaderContext) {
  try {
    return loadFromContext('vue-template-compiler', loaderContext.rootContext)
  } catch (e) {
    if (/version mismatch/.test(e.toString())) {
      loaderContext.emitError(e)
    } else {
      loaderContext.emitError(
        new Error(
          `[vue-loader] vue-template-compiler must be installed as a peer dependency, ` +
            `or a compatible compiler implementation must be passed via options.`
        )
      )
    }
  }
}
