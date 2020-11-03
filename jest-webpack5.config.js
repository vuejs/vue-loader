const config = require('./jest.config')

module.exports = {
  ...config,

  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    '^webpack$': 'webpack5',
    '^webpack/(.*)': 'webpack5/$1',
  },
}
