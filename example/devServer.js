// register proxy sub-paths
if (process.env.WEBPACK4) {
  console.log('using webpack 4...')
  const Module = require('module')
  const resolve = Module._resolveFilename
  Module._resolveFilename = (request, ...rest) => {
    if (request === 'webpack') {
      return resolve('webpack4', ...rest)
    }
    if (request.startsWith('webpack/')) {
      return resolve(request.replace(/^webpack\//, 'webpack4/'), ...rest)
    }
    return resolve(request, ...rest)
  }
}

require('webpack-dev-server/bin/webpack-dev-server.js')
