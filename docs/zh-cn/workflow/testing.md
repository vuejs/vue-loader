# 测试

当测试 `*.vue` 文件时，我们不能使用基于原生 CommonJS 的测试执行器，因为它不知道怎么处理 `*.vue` 文件。取而代之的是，依然使用 Webpack + vue-loader 去打包我们的测试文件，建议安装使用 [Karma](http://karma-runner.github.io/0.13/index.html) 和 [karma-webpack](https://github.com/webpack/karma-webpack)。

Karma 是一个测试调度执行器，能够打开浏览器替你执行测试。你可以选择要用哪些浏览器，以及哪些测试框架（如 Mocha 或 Jasmine）。下面是一个 Karma 的配置例子，在 [PhantomJS](http://phantomjs.org/) 中运行测试，其中使用 [Jasmine](http://jasmine.github.io/edge/introduction.html) 测试框架：

``` bash
npm install\
  karma karma-webpack\
  karma-jasmine jasmine-core\
  karma-phantomjs-launcher phantomjs\
  --save-dev
```

``` js
// 我们可以就用恰似一样的 webpack 配置，通过 require 加载它
// 不过记得删除原来配置的入口，因为我们测试不需要它
var webpackConfig = require('./webpack.config.js')
delete webpackConfig.entry

// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    // 这是所有测试文件的入口文件
    files: ['test/index.js'],
    // 把入口文件传给 webpack 去打包
    preprocessors: {
      'test/index.js': ['webpack']
    },
    // 使用之前的 webpack 配置
    webpack: webpackConfig,
    // 避免出现一堆无用的信息
    webpackMiddleware: {
      noInfo: true
    },
    singleRun: true
  })
}
```

接着，对于入口文件 `test/index.js`：

``` js
// test/index.js
// 使用 Webpack 的特殊功能，加载所有测试文件
// https://webpack.github.io/docs/context.html#require-context
var testsContext = require.context('.', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
```

入口文件只是简单的 require 同目录下，其他所有以 `.spec.js` 结尾的文件。现在我们可以真的来写点测试：

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

添加下面的 NPM script 用来运行测试：

``` js
// package.json
...
"scripts": {
  ...
  "test": "karma start karma.conf.js"
}
...
```

最后运行:

``` bash
npm test
```

再次安利，[vue-loader-example](https://github.com/vuejs/vue-loader-example) 包含完全可跑的测试例子。
