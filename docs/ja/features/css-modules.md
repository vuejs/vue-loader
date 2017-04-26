# CSS モジュール

> バージョン ^9.8.0 が必要

[CSS モジュール](https://github.com/css-modules/css-modules) は CSS をモジュール化して構成するための一般的なシステムです。`vue-loader` はシミュレートされたスコープ付き CSS の代わりに CSS モジュールの一流の統合を提供します。

### 使い方

`module` 属性を `<style>` タグに追加します:

``` html
<style module>
.red {
  color: red;
}
.bold {
  font-weight: bold;
}
</style>
```

`css-loader` の CSS モジュールモードを有効にし、その結果クラス識別子オブジェクトは `$style` という名前の算出プロパティとしてコンポーネントに注入されます。ダイナミッククラスバインディングを利用してテンプレートで使用可能になります。

``` html
<template>
  <p :class="$style.red">
    This should be red
  </p>
</template>
```

これは算出プロパティなので、`:class` の オブジェクト / 配列構文でも動作します:

``` html
<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      Am I red?
    </p>
    <p :class="[$style.red, $style.bold]">
      Red and bold
    </p>
  </div>
</template>
```

そして JavaScript からもアクセス可能です:

``` html
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "_1VyoJ-uZOjlOxP7jWUy19_0"
    // filename と className に基づいて出力された識別子。
  }
}
</script>
```

[CSS Modules spec](https://github.com/css-modules/css-modules) を参照してください。モードの詳細については [global exceptions](https://github.com/css-modules/css-modules#exceptions) と [composition](https://github.com/css-modules/css-modules#composition)を参照してください。

### カスタム注入名

単一の `*.vue` コンポーネントは複数の `<style>` タグを持つことが出来ます。注入されたスタイルが互いに上書きするのを避けるために、 `module`属性に値を与えることによって、注入された計算されたプロパティの名前をカスタマイズすることができます:

``` html
<style module="a">
  /* a として注入された識別子 */
</style>

<style module="b">
  /* b として注入された識別子 */
</style>
```

### `css-loader` クエリの設定

CSS モジュールは [css-loader](https://github.com/webpack/css-loader) によって処理されます。`<style module>` では `css-loader` に使われるデフォルトのクエリは次のようになります:

``` js
{
  modules: true,
  importLoaders: true,
  localIdentName: '[hash:base64]'
}
```

vue-loader の `cssModules`オプションを使って` css-loader`に追加のクエリオプションを提供することができます:

``` js
// webpack 1
vue: {
  cssModules: {
    // ローカルID名を上書きする
    localIdentName: '[path][name]---[local]---[hash:base64:5]',
    // キャメルケースを有効にする
    camelCase: true
  }
}

// webpack 2
module: {
  rules: [
    {
      test: '\.vue$',
      loader: 'vue-loader',
      options: {
        cssModules: {
          localIdentName: '[path][name]---[local]---[hash:base64:5]',
          camelCase: true
        }
      }
    }
  ]
}
```
