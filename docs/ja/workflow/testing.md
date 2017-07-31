# テスト

> [webpack vue-cli テンプレート](https://github.com/vuejs-templates/webpack)には、事前に設定された単体テストと e2e テストの設定が用意されています。

`* .vue`ファイルをテストするときには、普通の CommonJS ベースのテストランナーを使うことができません。なぜならそのテストランナーは `*.vue` ファイルの扱い方を知らないからです。代わりに、Webpack + vue-loader を使用してテストファイルをバンドルします。推奨設定は [Karma](http://karma-runner.github.io/0.13/index.html) と [karma-webpack](https://github.com/webpack/karma-webpack) です。

Karma はブラウザを起動してテストを実行するテストランナーです。テストするブラウザと、使用するテストフレームワーク（たとえば、MochaやJasmineなど）を選択できます。[PhantomJS](http://phantomjs.org/) のテストを[Jasmine](http://jasmine.github.io/edge/introduction.html) テストフレームワークで実行する Karma の設定例を次に示します:

``` bash
npm install\
  karma karma-webpack\
  karma-jasmine jasmine-core\
  karma-phantomjs-launcher phantomjs--prebuilt\
  --save-dev
```

``` js
// 要求があれば同じWebpackの設定を使用することが可能です
// ただし、テスト中に元のエントリが不要なので、
// 元のエントリを削除することを忘れないでください
var webpackConfig = require('./webpack.config.js')
delete webpackConfig.entry

// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    // これはすべてのテストのエントリーファイルです。
    files: ['test/index.js'],
    // バンドルのためにエントリーファイルをwebpackに渡します。
    preprocessors: {
      'test/index.js': ['webpack']
    },
    // webpackの設定を使用します
    webpack: webpackConfig,
    // 不要なテキスト出力を回避します
    webpackMiddleware: {
      noInfo: true
    },
    singleRun: true
  })
}
```

そして`test/index.js`ファイルのエントリの場合:

``` js
// test/index.js
// 特別なWebpackの機能を使用してすべてのテストファイルを必要とさせます
// https://webpack.github.io/docs/context.html#require-context
var testsContext = require.context('.', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
```

このエントリファイルは、単に同じフォルダ内の `.spec.js` で終わる他のすべてのファイルを必要とします。これで実際にいくつかのテストを書くことができます:

``` js
// test/component-a.spec.js
var Vue = require('vue')
var ComponentA = require('../../src/components/a.vue')

describe('a.vue', function () {

  // JavaScriptのオプションのアサーション
  it('should have correct message', function () {
    expect(ComponentA.data().msg).toBe('Hello from Component A!')
  })

  // 実際にコンポーネントをレンダリングしてレンダリングされた結果をアサートします
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

テストを実行するには、次の NPM スクリプトを追加します:

``` js
// package.json
...
"scripts": {
  ...
  "test": "karma start karma.conf.js"
}
...
```

最後に実行します:

``` bash
npm test
```

最後にもう一度、[こちらを参照してください](https://github.com/vuejs-templates/webpack)。テストに関する完全な実例が含まれています。
