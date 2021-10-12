const hash = require('hash-sum')

module.exports = function selectBlock (
  descriptor,
  loaderContext,
  query,
  appendExtension
) {
  // template
  if (query.type === `template`) {
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (descriptor.template.lang || 'html')
    }
    loaderContext.callback(
      null,
      descriptor.template.content,
      descriptor.template.map
    )
    return
  }

  // script
  if (query.type === `script`) {
    let content = descriptor.script.content
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (descriptor.script.lang || 'js')
    }
    if (/\.vue$/.test(loaderContext.resourcePath)) {
      const filePath = loaderContext.resourcePath.replace(loaderContext.rootContext, '').slice(1)
      const id = hash(filePath)
      const imports = descriptor.styles.map((style, $index) => {
        const styleImportName = `style${id}_${$index}`
        const lang = style.lang || 'css'
        const module = style.module || false
        const scoped = style.scoped || false
        const importStr = `import ${styleImportName} from '${loaderContext.resourcePath}?vue&type=style&index=${$index}&id=${id}&module=${module}&lang=${lang}&scoped=${scoped}&'`
        const forceSideEffect = `if(typeof ${styleImportName} === 'NEVERTRUE') ${styleImportName}();`
        return { importStr, forceSideEffect }
      })
      const importStr = imports.map(imp => imp.importStr).join('\n')
      const forceSideEffect = imports.map(imp => imp.forceSideEffect).join('\n')
      content = `${importStr}\n${content}\n${forceSideEffect}\n`
    }
    loaderContext.callback(
      null,
      content,
      descriptor.script.map
    )
    return
  }

  // styles
  if (query.type === `style` && query.index != null) {
    const style = descriptor.styles[query.index]
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (style.lang || 'css')
    }
    loaderContext.callback(
      null,
      style.content,
      style.map
    )
    return
  }

  // custom
  if (query.type === 'custom' && query.index != null) {
    const block = descriptor.customBlocks[query.index]
    loaderContext.callback(
      null,
      block.content,
      block.map
    )
    return
  }
}
