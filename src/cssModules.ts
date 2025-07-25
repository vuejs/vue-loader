export function genInitCSSModulesCode() {
  return `
const cssModules = {}
const cssModulesStore = {}
const getCssModules = (name) => {
  return Object.values(cssModulesStore[name]).reduce((acc, style) => Object.assign(acc, style), {})
}
`
}

export function genCSSModulesCode(
  id: string,
  index: number,
  request: string,
  moduleName: string | boolean,
  needsHotReload: boolean
): string {
  const styleVar = `style${index}`
  // inject variable
  const name = typeof moduleName === 'string' ? moduleName : '$style'
  let code = `
import ${styleVar} from ${request}

if (!cssModulesStore["${name}"]) {
  cssModulesStore["${name}"] = {}
}
cssModulesStore["${name}"]["${styleVar}"] = ${styleVar}
cssModules["${name}"] = getCssModules("${name}")
`

  if (needsHotReload) {
    code += `
if (module.hot) {
  module.hot.accept(${request}, () => {
    cssModulesStore["${name}"]["${styleVar}"] = ${styleVar}
    cssModules["${name}"] = getCssModules("${name}")
    __VUE_HMR_RUNTIME__.rerender("${id}")
  })
}`
  }

  return code
}
