import * as webpack from 'webpack'
import qs from 'querystring'
import chalk from 'chalk'
import loaderUtils from 'loader-utils'
import { VueLoaderOptions } from './'
import { SourceMapConsumer, RawSourceMap } from 'source-map'
import { compileTemplate, generateCodeFrame } from '@vue/compiler-sfc'
import mergeSourceMap from 'merge-source-map'

// Loader that compiles raw template into JavaScript functions.
// This is injected by the global pitcher (../pitch) for template
// selection requests initiated from vue files.
const TemplateLoader: webpack.loader.Loader = function(source, inMap) {
  source = String(source)
  const loaderContext = this

  // although this is not the main vue-loader, we can get access to the same
  // vue-loader options because we've set an ident in the plugin and used that
  // ident to create the request for this loader in the pitcher.
  const options = (loaderUtils.getOptions(loaderContext) ||
    {}) as VueLoaderOptions

  // const isServer = loaderContext.target === 'node'
  // const isProduction = options.productionMode || loaderContext.minimize || process.env.NODE_ENV === 'production'
  const query = qs.parse(loaderContext.resourceQuery.slice(1))
  const scopeId = query.scoped ? `data-v-${query.id}` : null

  const compiled = compileTemplate({
    source,
    // avoid source content overwriting the original
    filename: loaderContext.resourcePath,
    compiler: options.compiler,
    compilerOptions: {
      ...options.compilerOptions,
      scopeId
    },
    transformAssetUrls: options.transformAssetUrls || true
  })

  // tips
  if (compiled.tips.length) {
    compiled.tips.forEach(tip => {
      loaderContext.emitWarning(tip)
    })
  }

  // errors
  if (compiled.errors && compiled.errors.length) {
    const lineOffset = inMap ? getLineOffset(inMap) : 0
    compiled.errors.forEach(err => {
      if (typeof err === 'string') {
        loaderContext.emitError(err)
      } else {
        if (err.loc) {
          const filePath = chalk.gray(
            `at ${loaderContext.resourcePath}:${err.loc.start.line +
              lineOffset}:${err.loc.start.column}`
          )

          err.message = `\n${chalk.red(
            `Syntax Error: ${err.message}`
          )}\n${filePath}\n${chalk.yellow(
            generateCodeFrame(
              source as string,
              err.loc.start.offset,
              err.loc.end.offset,
              lineOffset
            )
          )}\n`
        }
        loaderContext.emitError(err)
      }
    })
  }

  let { code, map } = compiled
  if (map && inMap) {
    // avoid overwritting original *.vue source during merge
    map.sourcesContent = []
    map = mergeSourceMap(inMap, map)
  }
  loaderContext.callback(null, code, map)
}

function getLineOffset(map: RawSourceMap): number {
  const consumer = new SourceMapConsumer(map)
  let offset = 0
  consumer.eachMapping(map => {
    offset = map.originalLine - map.generatedLine
  })
  return offset
}

module.exports = TemplateLoader
