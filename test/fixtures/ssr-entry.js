import { renderToString } from 'vue/server-renderer'
import { createSSRApp } from 'vue'

import Component from '~target'
import * as exports from '~target'

export async function main() {
  const instance = createSSRApp(Component)
  const ssrContext = {}
  const markup = await renderToString(instance, ssrContext)
  return {
    instance,
    markup,
    componentModule: Component,
    ssrContext,
  }
}
