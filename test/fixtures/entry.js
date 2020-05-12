import Component from '~target'
import * as exports from '~target'

if (typeof window !== 'undefined') {
  window.module = Component
  window.exports = exports
}

export default Component
