const isWebpack4 = process.env.WEBPACK4

console.log(
  `running tests with webpack ${isWebpack4 ? '4' : '5'}${
    !isWebpack4 && process.env.INLINE_MATCH_RESOURCE
      ? ' with inline match resource enabled'
      : ''
  }...`
)

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
