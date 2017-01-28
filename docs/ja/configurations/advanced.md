# 高度なloaderの設定

時折`vue-loader`が推測するかわりに、言語にカスタム loader 文字列を適用することがあります。またデフォルトの言語のビルトイン loader の設定を上書きすることも出来ます。これを行うには、Webpack設定ファイルに `vue`ブロックを追加し、`loaders` オプションを指定します。

### Webpack 1.x

``` js
// webpack.config.js
module.exports = {
  // 他の設定
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  // vue-loader の設定
  vue: {
    // ... 他の Vue のオプション
    loaders: {
      // すべての<script>を lang属性なしでcoffee-loaerでロードする
      js: 'coffee',
      // <template>を直接HTML文字列としてロードする
      // 最初にvue-html-loaderをパイプする必要はない
      html: 'raw'
    }
  }
}
```

### Webpack 2.x (^2.1.0-beta.25)

``` js
module.exports = {
  // ほかのオプション
  module: {
    // module.rules は  1.x の module.loaders と同じ意味
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        // vue-loader のオプションはここ
        options: {
          loaders: {
            // ...
          }
        }
      }
    ]
  }
}
```

高度なローダー設定のより実用的な使用方法は、[コンポーネント内のCSSを1つのファイルに抽出する](./expression-css.md)にあります。
