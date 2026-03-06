module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: ['**/tests/**/*.test.js'],
  testEnvironment: 'jsdom',
};