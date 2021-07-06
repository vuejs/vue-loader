export const addStyleInjectionCode = `
var options = typeof script === 'function' ? script.options : script

function injectStyles() {
  Object.values(cssBlocks).forEach(function(cssBlock) {
    var styleElement = document.createElement('style')
    styleElement.type = 'text/css'
    styleElement.innerHTML = cssBlock.toString()
    document.head.appendChild(styleElement)
  })
}

var existing = options.beforeMount
options.beforeMount = function() {
  injectStyles()
  existing && existing()
}
`
