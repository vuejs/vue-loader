const qs = require('querystring')
const loaderUtils = require('loader-utils')
const compiler = require('vue-template-compiler')
const transformAssetUrl = require('./modules/assetUrl')
const transformSrcset = require('./modules/srcset')
const { genTemplateHotReloadCode } = require('../hotReload')
const { compileTemplate } = require('vue-component-compiler')

// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from vue files.
// Also handles lang="xxx" pre-processing via consolidate if necessary.
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
  const needsHotReload = !isServer && !isProduction && options.hotReload !== false
  const defaultModules = [transformAssetUrl(options.transformAssetUrl), transformSrcset()]
  const isFunctional = query.functional

  const userCompilerOptions = options.compilerOptions || {}
  const compilerOptions = Object.assign({}, userCompilerOptions, {
    scopeId: query.scoped ? `data-v-${id}` : null,
    modules: defaultModules.concat(userCompilerOptions.modules || []),
    comments: query.comments
  })

  const preprocessOptions = Object.assign({
    filename: this.resourcePath
  }, options.template)

  // for vue-component-compiler
  const finalOptions = {
    source,
    // allow using custom compiler via options
    compiler: options.compiler || compiler,
    compilerOptions,
    // handle possible lang="xxx"
    preprocessLang: query.lang,
    preprocessOptions,
    // allow customizing behavior of vue-template-es2015-compiler
    transpileOptions: options.transpileOptions,
    isProduction,
    isFunctional,
    optimizeSSR: isServer && options.optimizeSSR !== false
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

  let { code } = compiled

  // hot-reload
  if (needsHotReload) {
    code += genTemplateHotReloadCode(id)
  }

  // finish with ESM exports
  code += `export { render, staticRenderFns }`
  return code
}

function pad (source) {
  return source
    .split(/\r?\n/)
    .map(line => `  ${line}`)
    .join('\n')
}
