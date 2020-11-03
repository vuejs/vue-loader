module.exports = {
  preset: 'ts-jest',
  testTimeout: 10000,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
}
