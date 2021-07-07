interface ComponentOptions {
  beforeMount?(): void
  __cssBlocks: Record<string, CSSBlock>
  shadowRoot?: HTMLElement
}

interface ComponentInstance {
  $options: ComponentOptions
  $root: ComponentInstance
}

interface CSSBlock {
  id: string
}

function getStyleElement(id: string, parent: HTMLElement) {
  var existing = parent.querySelector("[data-style-id='" + id + "']")
  if (existing) return existing

  var styleElement = document.createElement('style')
  styleElement.setAttribute('data-style-id', id)
  styleElement.setAttribute('type', 'text/css')
  parent.appendChild(styleElement)
  return styleElement
}

function injectStyles(component: ComponentInstance) {
  const parent = component.$root.$options.shadowRoot || document.head
  Object.values(component.$options.__cssBlocks).forEach(function (cssBlock) {
    var styleElement = getStyleElement(cssBlock.id, parent)
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
