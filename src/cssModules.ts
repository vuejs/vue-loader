export function genCSSModulesCode(
  id: string,
  index: number,
  request: string,
  moduleName: string | boolean,
  needsHotReload: boolean
): string {
  const styleVar = `style${index}`
  let code = `\nimport ${styleVar} from ${request}`

  // inject variable
  const name = typeof moduleName === 'string' ? moduleName : '$style'

  const moduleAdd = `
  if(cssModules["${name}"]){
      Object.assign(cssModules["${name}"], ${styleVar});
  } else {
      cssModules["${name}"] = ${styleVar};
  }`
  code += `${moduleAdd}`

  if (needsHotReload) {
    code += `
if (module.hot) {
  module.hot.accept(${request}, () => {
    ${moduleAdd}
    __VUE_HMR_RUNTIME__.rerender("${id}")
  })
}`
  }

  return code
}
