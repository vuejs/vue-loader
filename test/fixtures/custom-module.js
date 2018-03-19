module.exports = [
  {
    postTransformNode: el => {
      if (el.staticClass) {
        el.staticClass = '"red blue"'
      }
    }
  }
]
