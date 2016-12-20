# 테스트

> [webpack vue-cli template](https://github.com/vuejs-templates/webpack)은 유닛 테스트 및 e2e 테스트 설정을 사전에 제공합니다.

`*.vue` 파일을 테스트할 때 `*.vue` 파일 처리 방법을 알지 못하기 때문에 CommonJS 기반 테스트 러너를 사용할 수 없습니다. 대신 Webpack + vue-loader를 사용하여 테스트 파일을 번들로 제공합니다. [Karma](http://karma-runner.github.io/0.13/index.html) 및 [karma-webpack](https://github.com/webpack/karma-webpack)을 사용하는 것을 추천합니다.

Karma는 브라우저를 실행하고 테스트를 실행하는 테스트 러너입니다. 테스트할 브라우저와 사용할 테스트 프레임워크(Mocha 또는 Jasmine)를 선택할 수 있습니다. 다음은 [PhantomJS](http://phantomjs.org/) 내부에서 [Jasmine](http://jasmine.github.io/edge/introduction.html)을 사용하여 테스트를 실행하는 Karma 설정의 예입니다.

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

그리고 엔트리 파일`test/index.js`을 작성합니다.

``` js
// test/index.js
// require all test files using special Webpack feature
// https://webpack.github.io/docs/context.html#require-context
var testsContext = require.context('.', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
```

이 엔트리 파일은 같은 폴더에 있는 `.spec.js`로 끝나는 다른 모든 파일을 요구합니다. 이제 우리는 실제로 몇 가지 테스트를 작성할 수 있습니다.

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

테스트를 추가하려면 다음 NPM 스크립트를 추가하세요.

``` js
// package.json
...
"scripts": {
  ...
  "test": "karma start karma.conf.js"
}
...
```

마지막으로 실행해봅시다.

``` bash
npm test
```

다시 말하자면, [webpack vue-cli 템플릿](https://github.com/vuejs-templates/webpack)에는 테스트에 대한 완전한 예제가 들어 있습니다.
