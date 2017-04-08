# モックを使用したテスト

現実のアプリケーションでは、私たちのコンポーネントは外部依存関係を持つ可能性が高いです。コンポーネントの単体テストを記述するときは、外部依存関係をモックにし、テストはテスト対象のコンポーネントの動作に依存するだけになるのが理想です。

`vue-loader` は、[inject-loader](https://github.com/plasticine/inject-loader)を使って任意の依存関係を `*.vue` コンポーネントに注入する機能を提供します。一般的な考え方としては、コンポーネントモジュールを直接インポートするのではなく、`inject-loader` を使用して、そのモジュール用の「モジュールファクトリ」関数を作成するというものです。この関数がモックのオブジェクトで呼び出されると、モックが注入されたモジュールのインスタンスが返されます。

次のようなコンポーネントがあるとします:

``` html
<!-- example.vue -->
<template>
  <div class="msg">{{ msg }}</div>
</template>

<script>
// この依存はモックを必要としています
import SomeService from '../service'

export default {
  data () {
    return {
      msg: SomeService.msg
    }
  }
}
</script>
```

モックをインポートする方法は次のとおりです:

> 注意: inject-loader@3.x は現在 unstable です。

``` bash
npm install inject-loader@^2.0.0 --save-dev
```

``` js
// example.spec.js
const ExampleInjector = require('!!vue?inject!./example.vue')
```

注意。狂気じみた文字列を必要とします - ここではいくつかのインライン [webpack loader](https://webpack.github.io/docs/loaders.html) を使用しています。簡単な説明としては:

- `!!`は "グローバル設定からすべてのローダを無効にする"ことを意味します；
- `vue？inject！` は  "`vue` loader を使い、`？inject` クエリを渡す"ことを意味します。 これは `vue-loader` に、依存性注入モードでコンポーネントをコンパイルするように指示します。

返される `ExampleInjector` は、`example.vue` モジュールのインスタンスを生成するために呼び出すことができるファクトリ関数です:

``` js
const ExampleWithMocks = ExampleInjector({
  // モック
  '../service': {
    msg: 'Hello from a mocked service!'
  }
})
```

最後に、コンポーネントを通常どおりテストすることができます:

``` js
it('should render', () => {
  const vm = new Vue({
    template: '<div><test></test></div>',
    components: {
      'test': ExampleWithMocks
    }
  }).$mount()
  expect(vm.$el.querySelector('.msg').textContent).toBe('Hello from a mocked service!')
})
```
