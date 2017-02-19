# Linting

あなたはJavaScriptでない `*.vue` の中のコードをどうやってlintするのか疑問に思っているかも知れません。[ESLint](http://eslint.org/)を使用していると仮定します（もし使っていないのならばすべきです！）
You may have been wondering how do you lint your code inside `*.vue` files, since they are not JavaScript. We will assume you are using [ESLint](http://eslint.org/) (if you are not, you should!).

`* .vue`ファイル内のJavaScriptの抽出と埋め込みをサポートする[eslint-plugin-html]（https://github.com/BenoitZugmeyer/eslint-plugin-html）も同様に必要です。

あなたのESLintの設定にプラグインを含めてください：

``` json
"plugins": [
  "html"
]
```

コマンドラインで次を実行してください：

``` bash
eslint --ext js,vue MyComponent.vue
```

別のオプションは `* .vue` ファイルが開発中に保存時されたとき、自動的にlintされるように[eslint-loader]（https://github.com/MoOx/eslint-loader）を使用しています：

``` bash
npm install eslint eslint-loader --save-dev
```

``` js
// webpack.config.js
module.exports = {
  // ... other options
  module: {
    loaders: [
      {
        test: /.vue$/,
        loader: 'vue!eslint'
      }
    ]
  }
}
```
Webpackローダーチェーンは**まずはじめに**に適用されます。`vue`の前に` eslint`を適用して、コンパイル前のソースコードをlintしてください。

一つ私たちが考慮する必要があるのは、NPMパッケージでリリースされているサードパーティの* .vueコンポーネントを使用することです。そのような場合には、サードパーティー製のコンポーネントを処理するために `vue-loader`を使用したいと思いますが、それをlintしたくはありません。そういうときはlintをWebpackの[preLoaders]（https://webpack.github.io/docs/loaders.html#loader-order）に分けることが可能です：

``` js
// webpack.config.js
module.exports = {
  // ... 他のオプション
  module: {
    // lint対象はローカルの *.vue ふぁるのみ
    preLoaders: [
      {
        test: /.vue$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    // しかし全ての *.vue ファイルでvue-loaderを使用します
    loaders: [
      {
        test: /.vue$/,
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
  // ... other options
  module: {
    rules: [
      // only lint local *.vue files
      {
        enforce: 'pre',
        test: /.vue$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      // but use vue-loader for all *.vue files
      {
        test: /.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
}
```
