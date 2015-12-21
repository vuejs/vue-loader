# Testing

When testing `*.vue` files, we cannot use a plain CommonJS-based test runner because it won't know how to handle `*.vue` files. Instead, we still use Webpack + vue-loader to bundle our test files. The recommended setup is using [Karma](http://karma-runner.github.io/0.13/index.html) and [karma-webpack](https://github.com/webpack/karma-webpack).

Karma is a test runner that launches browsers and runs your tests for you. You can choose what browsers you want to test in and what test framework (e.g. Mocha or Jasmine) you want to use. Here is an example Karma configuration that runs the tests inside [PhantomJS](http://phantomjs.org/) with the [Jasmine](http://jasmine.github.io/edge/introduction.html) test framework:

``` bash
npm install\
  karma karma-webpack\
  karma-jasmine jasmine-core\
  karma-phantomjs-launcher phantomjs\
  --save-dev
```

``` js
// we can just use the exact same webpack config by requiring it
// however, remember to delete the original entry since we don't
// need it during tests
var webpackConfig = require('./webpack.config.js')
delete webpackConfig.entry

// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    // this is the entry file for all our tests.
    files: ['test/index.js'],
    // we will pass the entry file to webpack for bundling.
    preprocessors: {
      'test/index.js': ['webpack']
    },
    // use the webpack config
    webpack: webpackConfig,
    // avoid walls of useless text
    webpackMiddleware: {
      noInfo: true
    },
    singleRun: true
  })
}
```

And for the entry `test/index.js` file:

``` js
// test/index.js
// require all test files using special Webpack feature
// https://webpack.github.io/docs/context.html#require-context
var testsContext = require.context('.', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
```

This entry file simply requires all other files that ends in `.spec.js` in the same folder. Now we can actually write some tests:

``` js
// test/component-a.spec.js
var Vue = require('vue')
var ComponentA = require('../../src/components/a.vue')

describe('a.vue', function () {

  // asserting JavaScript options
  it('should have correct message', function () {
    expect(ComponentA.data().msg).toBe('Hello from Component A!')
  })

  // asserting rendered result by actually rendering the component
  it('should render correct message', function () {
    var vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        'test': ComponentA
      }
    }).$mount()
    expect(vm.$el.querySelector('h2.red').textContent).toBe('Hello from Component A!')
  })
})
```

To run the tests, add the following NPM script:

``` js
// package.json
...
"scripts": {
  ...
  "test": "karma start karma.conf.js"
}
...
```

Finally, run:

``` bash
npm test
```

Again, [vue-loader-example](https://github.com/vuejs/vue-loader-example) contains a fully working example with tests.
