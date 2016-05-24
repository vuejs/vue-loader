module.exports = function (config) {
  config.set({
    preprocessors: {
      '**/*.vue': ['webpack', 'sourcemap']
    },
    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.vue$/, loader: './index.js' }
        ]
      }
    },
    frameworks: ['mocha', 'chai'],
    files: ['test/*.vue'],
    plugins: [
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher'),
      require('karma-sourcemap-loader')
    ]
  })
}
