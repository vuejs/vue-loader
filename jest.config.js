console.log(`running tests with webpack ${process.env.WEBPACK4 ? '4' : '5'}...`)

module.exports = {
  preset: 'ts-jest',
  testTimeout: 60000,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  moduleNameMapper: process.env.WEBPACK4
    ? {
        '^webpack$': 'webpack4',
        '^webpack/(.*)': 'webpack4/$1',
      }
    : undefined,
}
