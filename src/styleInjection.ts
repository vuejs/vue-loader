interface ComponentOptions {
  beforeMount?(): void
  __cssBlocks: Record<string, CSSBlock>
}

interface ComponentInstance {
  $options: ComponentOptions
}

interface CSSBlock {
  id: string
}

function getStyleElement(id: string) {
  var existing = document.querySelector("[data-style-id='" + id + "']")
  if (existing) return existing

  var styleElement = document.createElement('style')
  styleElement.setAttribute('data-style-id', id)
  styleElement.setAttribute('type', 'text/css')
  document.head.appendChild(styleElement)
  return styleElement
}

function injectStyles(component: ComponentInstance) {
  Object.values(component.$options.__cssBlocks).forEach(function (cssBlock) {
    var styleElement = getStyleElement(cssBlock.id)
    styleElement.innerHTML = cssBlock.toString()
  })
}

export default function addStyleInjectionCode(script: ComponentOptions) {
  var existing = script.beforeMount
  script.beforeMount = function beforeMount() {
    injectStyles(this)
    existing && existing()
  }
}
