# 测试

> [webpack vue-cli 模板](https://github.com/vuejs-templates/webpack)为你提供预配置的单元测试和 e2e 测试设置。

当测试 `*.vue` 文件时，我们不能使用基于 CommonJS 的简单测试运行器，因为它不知道如何处理 `*.vue` 文件。而是应该使用 webpack + vue-loader 打包我们的测试文件。推荐的设置是使用 [Karma](https://karma-runner.github.io/0.13/index.html) 和 [karma-webpack](https://github.com/webpack/karma-webpack)。

Karma 是一个启动浏览器并为你运行测试的测试运行器。你可以选择要测试的浏览器以及你要使用的测试框架 (例如 Mocha 或 Jasmine)。以下是一个在 [PhantomJS](http://phantomjs.org/) 中使用 [Jasmine](https://jasmine.github.io/edge/introduction.html) 测试框架运行测试的 Karma 配置示例：

``` bash
npm install\
  karma karma-webpack\
  karma-jasmine jasmine-core\
  karma-phantomjs-launcher phantomjs-prebuilt\
  --save-dev
```

``` js
// 我们只需要使用完全相同的 webpack 配置即可
// 但是，请记得删除原来的 entry，因为我们在测试期间不需要它
var webpackConfig = require('./webpack.config.js')
delete webpackConfig.entry

// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    // 这是所有测试的入口文件。
    files: ['test/index.js'],
    // 把入口文件传给 webpack 以进行打包。
    preprocessors: {
      'test/index.js': ['webpack']
    },
    // 使用 webpack 配置
    webpack: webpackConfig,
    // 避免被无用文本刷屏
    webpackMiddleware: {
      noInfo: true
    },
    singleRun: true
  })
}
```

`test/index.js` 文件如下：

``` js
// test/index.js
// 通过该特殊 webpack 特性引入所有测试文件
// https://webpack.github.io/docs/context.html#require-context
var testsContext = require.context('.', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
```

此入口文件只需要在同一文件夹中的 `.spec.js` 结尾引入其他所有文件。现在我们可以写一些测试：

``` js
// test/component-a.spec.js
var Vue = require('vue')
var ComponentA = require('../../src/components/a.vue')

describe('a.vue', function () {

  // JavaScript 选项断言
  it('should have correct message', function () {
    expect(ComponentA.data().msg).toBe('Hello from Component A!')
  })

  // 组件实际渲染的渲染结果断言
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

添加以下 NPM 脚本以运行测试：

``` js
// package.json
...
"scripts": {
  ...
  "test": "karma start karma.conf.js"
}
...
```

最后运行：

``` bash
npm test
```

此外，[webpack vue-cli 模板](https://github.com/vuejs-templates/webpack)包含一个完整的测试用例。
