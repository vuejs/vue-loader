module.exports = function assemble (sourcePath, descriptor) {
  const templateImport = descriptor.template
    ? `import { render, staticRenderFns } from '${sourcePath}?template'`
    : ``

  const scriptImport = descriptor.script
    ? `import script from '${sourcePath}?script'`
    : `const script = {}`

  const styleImports = descriptor.styles.map((_, i) => {
    return `import style${i} from '${sourcePath}?style&index=${i}'`
  }).join('\n')

  return `
${templateImport}
${scriptImport}
${styleImports}
script.render = render
script.staticRenderFns = staticRenderFns
export default script
`.trim()
}
