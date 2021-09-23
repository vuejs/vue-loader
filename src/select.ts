import webpack = require('webpack')
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type { ParsedUrlQuery } from 'querystring'
import { resolveScript } from './resolveScript'
import type { VueLoaderOptions } from 'src'

export function selectBlock(
  descriptor: SFCDescriptor,
  scopeId: string,
  options: VueLoaderOptions,
  loaderContext: webpack.loader.LoaderContext,
  query: ParsedUrlQuery,
  appendExtension: boolean
) {
  // template
  if (query.type === `template`) {
    // if we are receiving a query with type it can only come from a *.vue file
    // that contains that block, so the block is guaranteed to exist.
    const template = descriptor.template!
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (template.lang || 'html')
    }
    loaderContext.callback(null, template.content, template.map)
    return
  }

  // script
  if (query.type === `script`) {
    const script = resolveScript(descriptor, scopeId, options, loaderContext)!
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (script.lang || 'js')
    }
    loaderContext.callback(null, script.content, script.map)
    return
  }

  // styles
  if (query.type === `style` && query.index != null) {
    const style = descriptor.styles[Number(query.index)]
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (style.lang || 'css')
    }
    loaderContext.callback(null, style.content, style.map)
    return
  }

  // custom
  if (query.type === 'custom' && query.index != null) {
    const block = descriptor.customBlocks[Number(query.index)]
    loaderContext.callback(null, block.content, block.map)
  }
}
