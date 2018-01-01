# PostCSS

`vue-loader`により処理されたCSSのアウトプットはスコープされたCSSに書き換えるために[PostCSS](https://github.com/postcss/postcss) を通します。カスタムされた PostCSSプラグインをプロセスに追加することが出来ます。例えば、[autoprefixer](https://github.com/postcss/autoprefixer) や [CSSNext](http://cssnext.io/)があります。

## 設定ファイルの使用

バージョン 11.0 以降、 `vue-loader` は [`postcss-loader`](https://github.com/postcss/postcss-loader#usage) でサポートされているものと同じ PostCss の設定ファイルのオートロードをサポートします:

- `postcss.config.js`
- `.postcssrc`
- `package.json` 内の `postcss`

設定ファイルを使用すると `postcss-loader` で処理された通常の CSS ファイルと `*.vue` ファイル内の CSS で同じ設定を共有することができます。

## インラインオプション

あるいは、 `vue-loader` の `postcss` オプションを使用して `*.vue` ファイル用の PostCSS の設定を指定することが出来ます。

webpack 1.x の例:

``` js
// webpack.config.js
module.exports = {
  // 他の設定
  vue: {
    // カスタムされた PostCSS プラグインを使用します
    postcss: [require('postcss-cssnext')()]
  }
}
```

webpack 2.x の例:

``` js
// webpack.config.js
module.exports = {
  // 他の設定
  module: {
    // `module.rules` は 1.x の `module.loaders` と同じです
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // `vue-loader` のオプションはここです
        options: {
          // ...
          postcss: [require('postcss-cssnext')()]
        }
      }
    ]
  }
}
```

加えて plugin の配列を提供し、`postcss` オプションは以下も受け入れます

- プラグインの配列を返す関数
- PostCSSプロセッサに渡すオプションを含むオブジェクト。これは、カスタム parser/stringifiers に依存するPostCSSプロジェクトを使用している場合に便利です:

  ``` js
  postcss: {
    plugins: [...], // プラグインのリスト
    options: {
      parser: sugarss // sugarss パーサーを使用します
    }
  }
  ```
