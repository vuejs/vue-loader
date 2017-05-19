# リント

あなたは JavaScript でない `*.vue` の中のコードをどうやってリント (lint) するのか疑問に思っているかも知れません。[ESLint](http://eslint.org/) を使用していると仮定します(もし使っていないのならばすべきです!)

`* .vue`ファイル内のJavaScriptの抽出と埋め込みをサポートする[eslint-plugin-html](https://github.com/BenoitZugmeyer/eslint-plugin-html)も同様に必要です。

あなたの ESLint の設定にプラグインを含めてください:

``` json
"plugins": [
  "html"
]
```

コマンドラインで次を実行してください:

``` bash
eslint --ext js,vue MyComponent.vue
```

別のオプションは `*.vue` ファイルが開発中に保存時されたとき、自動的にリントされるように [eslint-loader](https://github.com/MoOx/eslint-loader) を使用しています:

``` bash
npm install eslint eslint-loader --save-dev
```

``` js
// webpack.config.js
module.exports = {
  // 他のオプション
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue!eslint'
      }
    ]
  }
}
```
Webpack ローダーチェーンは**まずはじめに**に適用されることをご了承ください。`vue` の前に `eslint` を適用して、コンパイル前のソースコードをリントしてください。

1 つ私たちが考慮する必要があるのは、NPM パッケージでリリースされているサードパーティの* .vueコンポーネントを使用することです。そのような場合には、サードパーティー製のコンポーネントを処理するために  `vue-loader` を使用したいと思いますが、それをリントしたくはありません。そういうときはリントを Webpack の [preLoaders](https://webpack.github.io/docs/loaders.html#loader-order) に分けることが可能です:

``` js
// webpack.config.js
module.exports = {
  // 他のオプション
  module: {
    // リント対象はローカルの *.vue ファイルのみ
    preLoaders: [
      {
        test: /\.vue$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    // しかし全ての *.vue ファイルで vue-loader を使用します
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  }
}
```

Webpack 2.x:

``` js
// webpack.config.js
module.exports = {
  // 他のオプション
  module: {
    rules: [
      // *.vue のみを検査します
      {
        enforce: 'pre',
        test: /\.vue$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      // しかし全ての *.vue ファイルで vue-loader は使用します
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
}
```
