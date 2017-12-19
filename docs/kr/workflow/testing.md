# 테스트

> [webpack vue-cli 템플릿](https://github.com/vuejs-templates/webpack)은 유닛 테스트 및 e2e 테스트 설정을 사전에 제공합니다.

`*.vue` 파일을 테스트할 때 `*.vue` 파일 처리 방법을 모르기 때문에 CommonJS 기반 테스트 러너를 사용할 수 없습니다. 대신 webpack + vue-loader를 사용하여 테스트 파일을 번들로 제공합니다. [Karma](http://karma-runner.github.io/0.13/index.html) 및 [karma-webpack](https://github.com/webpack/karma-webpack)을 사용하는 것을 추천합니다.

Karma는 브라우저를 실행하고 테스트를 실행하는 테스트 러너입니다. 테스트할 브라우저와 사용할 테스트 프레임워크(Mocha 또는 Jasmine)를 선택할 수 있습니다. 다음은 [PhantomJS](http://phantomjs.org/) 내부에서 [Jasmine](http://jasmine.github.io/edge/introduction.html)을 사용하여 테스트를 실행하는 Karma 설정의 예입니다.

``` bash
npm install\
  karma karma-webpack\
  karma-jasmine jasmine-core\
  karma-phantomjs-launcher phantomjs\
  --save-dev
```

``` js
// 우리는 정확히 똑같은 webpack 설정을 요구할 수 있습니다
// 하지만, 테스트 중에는 필요하지 않기 때문에
// 원래 항목을 지우는 것을 잊지 마십시오.
var webpackConfig = require('./webpack.config.js')
delete webpackConfig.entry

// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    // 이 파일은 모든 테스트의 시작점입니다.
    files: ['test/index.js'],
    // 우리는 번들을 위해 webpack에 엔트리 파일을 전달할 것입니다.
    preprocessors: {
      'test/index.js': ['webpack']
    },
    // webpack 설정을 사용합니다.
    webpack: webpackConfig,
    // 쓸모없는 텍스트들을 피합니다.
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
// 특별한 webpack 기능을 사용하기 위해 모든 테스트 파일이 필요합니다.
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

  // JavsScript 옵션을 검사합니다.
  it('should have correct message', function () {
    expect(ComponentA.data().msg).toBe('Hello from Component A!')
  })

  // 실제로 그 컴포넌트를 렌더링하여 렌더링된 결과를 검사합니다.
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

다시 말해, [webpack vue-cli 템플릿](https://github.com/vuejs-templates/webpack)에는 테스트에 대한 완전한 예제가 있습니다.
