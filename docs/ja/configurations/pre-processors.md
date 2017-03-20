# プリプロセッサの使用

Webpack において、全てのプリプロセッサは対応するloaderを適用する必要があります。 `vue-loader` は他の Webpack の loader を使って Vue コンポーネントを処理することが出来ます。言語ブロックの `lang` 属性から適切なloaderを自動的に推論します。

### CSS

例えば、SASS で `<style>` タグをコンパイルしましょう：

``` bash
npm install sass-loader node-sass --save-dev
```

``` html
<style lang="sass">
  /* ここにSASSを書きます */
</style>
```

 `<style>` タグ内のテキストコンテンツは、`sass-loader` によって最初にコンパイルされ、その後の処理のために渡されます。

#### sass-loader 使用時の注意

その名前が示すものとは対照的に、[* sass * -loader](https://github.com/jtangelder/sass-loader) はデフォルトで *SCSS* の構文を解析します。インデントされた *SASS* 構文を実際に使用する場合は、それに応じて sass-loader へ vue-loader のオプションを設定する必要があります。

```javascript
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      scss: 'vue-style-loader!css-loader!sass-loader' // <style lang="scss">
      sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
    }
  }
}
```

vue-loader を構成する方法の詳細については、[高度なloaderの設定]（./advanced.md）セクションを参照してください。

### JavaScript

全てのVueコンポーネントのJavaScriptはデフォルトで `babel-loader` によって処理されます。しかしもちろんそれは変更することが可能です：

``` bash
npm install coffee-loader --save-dev
```

``` html
<script lang="coffee">
  # coffeescriptを書いてください!
</script>
```

### テンプレート

`pug-loader`のようなほとんどのWebpackテンプレートloaderは、コンパイルされたHTML文字列の代わりにテンプレート関数を返すので、templateの処理は少し異なります。`pug-loader` を使う代わりに、オリジナルの `pug` をインストールをするだけです：

``` bash
npm install pug --save-dev
```

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

> **重要:** もし `vue-loader@<8.2.0` を使うのであれば、`template-html-loader` が必要になります。

### インラインローダーリクエスト

`lang` 属性で [Webpack loader requests](https://webpack.github.io/docs/loaders.html#introduction) を使用することが可能です：

``` html
<style lang="sass?outputStyle=expanded">
  /* use sass here with expanded output */
</style>
```

ただこれにより Vue コンポーネントが Webpack 固有となり Browserify および [vueify](https://github.com/vuejs/vueify) と互換性がなくなります。 **Vueコンポーネントを再利用可能なサードパーティコンポーネントとして提供する場合は、この構文を使用しないでください。**
