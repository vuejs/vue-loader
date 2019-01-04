const qs = require('querystring')
const loaderUtils = require('loader-utils')
const { compileTemplate } = require('@vue/component-compiler-utils')

// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from vue files.
module.exports = function (source) {
  const loaderContext = this
  const query = qs.parse(this.resourceQuery.slice(1))

  // although this is not the main vue-loader, we can get access to the same
  // vue-loader options because we've set an ident in the plugin and used that
  // ident to create the request for this loader in the pitcher.
  const options = loaderUtils.getOptions(loaderContext) || {}
  const { id } = query
  const isServer = loaderContext.target === 'node'
  const isProduction = loaderContext.minimize || process.env.NODE_ENV === 'production'
  const isFunctional = query.functional

  // allow using custom compiler via options
  const compiler = options.compiler || require('vue-template-compiler')
  const compilerOptions = Object.assign({}, options.compilerOptions, {
    scopeId: query.scoped ? `data-v-${id}` : null,
    comments: query.comments
  })

  // for vue-component-compiler
  const finalOptions = {
    source,
    filename: this.resourcePath,
    compiler,
    compilerOptions,
    // allow customizing behavior of vue-template-es2015-compiler
    transpileOptions: options.transpileOptions,
    transformAssetUrls: options.transformAssetUrls || true,
    isProduction,
    isFunctional,
    optimizeSSR: isServer && options.optimizeSSR !== false,
    prettify: options.prettify
  }

  const compiled = compileTemplate(finalOptions)

  // tips
  if (compiled.tips && compiled.tips.length) {
    compiled.tips.forEach(tip => {
      loaderContext.emitWarning(tip)
    })
  }

  // errors
  if (compiled.errors && compiled.errors.length) {
    loaderContext.emitError(
      `\n  Error compiling template:\n${pad(compiled.source)}\n` +
        compiled.errors.map(e => `  - ${e}`).join('\n') +
        '\n'
    )
  }

  const { code } = compiled

  // finish with ESM exports
  return code + `\nexport { render, staticRenderFns }`
}

function pad (source) {
  return source
    .split(/\r?\n/)
    .map(line => `  ${line}`)
    .join('\n')
}
