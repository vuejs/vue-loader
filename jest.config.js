const config = {
  preset: 'ts-jest',
  testTimeout: 60000,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
}

if (process.env.WEBPACK5) {
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
} else {
  module.exports = config
}
