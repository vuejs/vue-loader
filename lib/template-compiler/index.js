const prettier = require('prettier')
const loaderUtils = require('loader-utils')
const compiler = require('vue-template-compiler')
const transpile = require('vue-template-es2015-compiler')
const transformRequire = require('./modules/transform-require')
const transformSrcset = require('./modules/transform-srcset')
const hotReloadAPIPath = require.resolve('vue-hot-reload-api')

module.exports = function compileTemplate (descriptor, loaderContext, id) {
  const sourceTemplate = descriptor.template.content
  const isServer = loaderContext.target === 'node'
  const isProduction = loaderContext.minimize || process.env.NODE_ENV === 'production'
  const options = loaderUtils.getOptions(loaderContext) || {}
  const needsHotReload = !isServer && !isProduction && options.hotReload !== false
  const defaultModules = [transformRequire(options.transformToRequire), transformSrcset()]
  const hasScoped = descriptor.styles.some(({ scoped }) => scoped)
  const templateAttrs = descriptor.template.attrs || {}
  const hasComment = !!templateAttrs.comments
  const hasFunctionalTemplate = !!templateAttrs.functional

  const compilerOptions = {
    preserveWhitespace: options.preserveWhitespace,
    modules: defaultModules.concat(options.compilerModules || []),
    directives: options.compilerDirectives || {},
    scopeId: hasScoped ? id : null,
    comments: hasComment
  }

  const compile =
    isServer && compiler.ssrCompile && options.optimizeSSR !== false
      ? compiler.ssrCompile
      : compiler.compile

  const compiled = compile(sourceTemplate, compilerOptions)

  // tips
  if (compiled.tips && compiled.tips.length) {
    compiled.tips.forEach(tip => {
      loaderContext.emitWarning(tip)
    })
  }

  let code
  if (compiled.errors && compiled.errors.length) {
    loaderContext.emitError(
      `\n  Error compiling template:\n${pad(sourceTemplate)}\n` +
        compiled.errors.map(e => `  - ${e}`).join('\n') +
        '\n'
    )
    code =
      `export var render = function () {}\n` +
      `export var staticRenderFns = []`
  } else {
    const bubleOptions = options.buble || {
      transforms: {
        stripWithFunctional: hasFunctionalTemplate
      }
    }
    const staticRenderFns = compiled.staticRenderFns.map(fn =>
      toFunction(fn, hasFunctionalTemplate)
    )

    code =
      transpile(
        'var render = ' +
          toFunction(compiled.render, hasFunctionalTemplate) +
          '\n' +
          'var staticRenderFns = [' +
          staticRenderFns.join(',') +
          ']',
        bubleOptions
      ) + '\n'

    // prettify render fn
    if (!isProduction) {
      code = prettier.format(code, { semi: false })
    }

    // mark with stripped (this enables Vue to use correct runtime proxy detection)
    if (!isProduction && bubleOptions.transforms.stripWith !== false) {
      code += `render._withStripped = true\n`
    }
    code += `export { render, staticRenderFns }`
  }
  // hot-reload
  if (needsHotReload) {
    code +=
      '\nif (module.hot) {\n' +
      '  module.hot.accept()\n' +
      '  if (module.hot.data) {\n' +
      '    require("' + hotReloadAPIPath + '")' +
      '      .rerender("' + options.id + '", { render: render, staticRenderFns: staticRenderFns })\n' +
      '  }\n' +
      '}'
  }

  return code
}

function toFunction (code, hasFunctionalTemplate) {
  return (
    'function (' + (hasFunctionalTemplate ? '_h,_vm' : '') + ') {' + code + '}'
  )
}

function pad (sourceTemplate) {
  return sourceTemplate
    .split(/\r?\n/)
    .map(line => `  ${line}`)
    .join('\n')
}
