import type { LoaderDefinitionFunction } from 'webpack'

const StyleInineLoader: LoaderDefinitionFunction = function (source) {
  // TODO minify this?
  return `export default ${JSON.stringify(source)}`
}

export default StyleInineLoader
