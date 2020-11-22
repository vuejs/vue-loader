// This script is part of `yarn build-example-ssr`.

const fs = require('fs')
const path = require('path')
const { renderToString } = require('@vue/server-renderer')
const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')

// here out server-side build directly exports an app instance.
// in an actual SSR setup, you'll want to export a `createApp()` function that
// returns a fresh app instance for each request. You probably also want to
// return the router instance so that you can set the app's route state before
// actually rendering it.
const app = require('./dist-ssr/server/main.js').default

renderToString(app).then((html) => {
  fs.writeFileSync(
    path.resolve(__dirname, 'dist-ssr/index.html'),
    template.replace(/(<div id="app">)/, `$1${html}`)
  )
})
