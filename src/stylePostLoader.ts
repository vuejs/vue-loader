import * as qs from 'querystring'
import type { LoaderDefinitionFunction } from 'webpack'
import { compiler } from './compiler'

const { compileStyle } = compiler

// This is a post loader that handles scoped CSS transforms.
// Injected right before css-loader by the global pitcher (../pitch.js)
// for any <style scoped> selection requests initiated from within vue files.
const StylePostLoader: LoaderDefinitionFunction = function (source, inMap) {
  const query = qs.parse(this.resourceQuery.slice(1))

  // skip normal CSS files
  if (!('vue' in query) || query.type !== 'style' || !query.id) {
    this.callback(null, source, inMap)
    return
  }

  const { code, map, errors } = compileStyle({
    source: source as string,
    filename: this.resourcePath,
    id: `data-v-${query.id}`,
    map: inMap as any,
    scoped: !!query.scoped,
    trim: true,
    isProd: this.mode === 'production' || process.env.NODE_ENV === 'production',
  })

  if (errors.length) {
    this.callback(errors[0])
  } else {
    this.callback(null, code, map as any)
  }
}

export default StylePostLoader
