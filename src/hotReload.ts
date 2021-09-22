// __VUE_HMR_RUNTIME__ is injected to global scope by @vue/runtime-core

export function genHotReloadCode(
  id: string,
  templateRequest: string | undefined
): string {
  return `
/* hot reload */
if (module.hot) {
  __exports__.__hmrId = "${id}"
  const api = __VUE_HMR_RUNTIME__
  module.hot.accept()
  if (!api.createRecord('${id}', __exports__)) {
    console.log('reload')
    api.reload('${id}', __exports__)
  }
  ${templateRequest ? genTemplateHotReloadCode(id, templateRequest) : ''}
}
`
}

function genTemplateHotReloadCode(id: string, request: string) {
  return `
  module.hot.accept(${request}, () => {
    console.log('re-render')
    api.rerender('${id}', render)
  })
`
}
