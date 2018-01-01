# 高度な loader の設定

時折こうしたくなるかもしれません:

1. `vue-loader` が推測するのではなく、カスタム loader の文字列を言語に適用する
2. デフォルトの言語の組み込み loader の設定の上書き
3. 特定の言語ブロックをカスタム loader で前処理か後処理をする

そうするためには、`vue-loader` に `loaders` オプションを指定してください:

> メモ: `preLoaders` と `postLoaders` は 10.3.0 以降でのみサポートされます

### webpack 2.x

``` js
module.exports = {
  // 他のオプション
  module: {
    // `module.rules` は 1.x での `module.loaders` と同じです
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `loaders` はデフォルトの loaderを上書きします。
          // 次の設定では、`lang` 属性のない全ての `<script>` タグに
          // `coffee-loader` が適用されます。
          loaders: {
            js: 'coffee-loader'
          },

          // `preLoaders` はデフォルトの loader の前に付加されます。
          // これを使用して言語ブロックを前処理することができます。
          // 一般的な使用例はビルドタイム i18n です。
          preLoaders: {
            js: '/path/to/custom/loader'
          },

          // `postLoaders` はデフォルトの loader の後につけられます。
          //
          // - `html` の場合、デフォルトの loader によって返される結果は、
          //   コンパイルされた JavaScript レンダリング関数コードになります。
          //
          // - `css` の場合、結果は `vue-style-loader` によって返されます。
          //   しかしこれはほとんどの場合特に有用ではありません。
          //   PostCSS プラグインを使用する方が良い選択になります。
          postLoaders: {
            html: 'babel-loader'
          },

          // `excludedPreLoaders` は正規表現で設定する必要があります。
          excludedPreLoaders: /(eslint-loader)/
        }
      }
    ]
  }
}
```

### webpack 1.x

``` js
// webpack.config.js
module.exports = {
  // ほかのオプション
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  // `vue-loader` の設定
  vue: {
    loaders: {
      // 上記の設定と同じ
    }
  }
}
```

高度な loader の設定のより実用的な使用方法は、[CSS を単一のファイルに抽出する](./expression-css.md)にあります。
