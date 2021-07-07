export const addStyleInjectionCode = `
var options = typeof script === 'function' ? script.options : script

function getStyleElement(id) {
  var existing = document.querySelector("[data-style-id='" + id + "']")
  if (existing) return existing

  var styleElement = document.createElement('style')
  styleElement.setAttribute("data-style-id", id)
  styleElement.setAttribute("type", "text/css")
  document.head.appendChild(styleElement)
  return styleElement
}
function injectStyles() {
  Object.values(cssBlocks).forEach(function(cssBlock) {
    var styleElement = getStyleElement(cssBlock.id)
    styleElement.innerHTML = cssBlock.toString()
  })
}

var beforeCreate = options.beforeCreate
options.beforeCreate = function beforeCreate() {
  injectStyles()
  beforeCreate && beforeCreate()
}
`
