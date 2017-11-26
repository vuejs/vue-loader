# プロダクションビルド

プロダクション用にバンドルを構築するときは 2 つのことを行います:

1. アプリケーションコードを縮小します:
2. [Vue.jsガイドに記載されているセットアップの説明](https://vuejs.org/guide/deployment.html) を使用して Vue.js のソースコードから全ての警告を削除します

設定例を以下に示します:

``` js
// webpack.config.js
module.exports = {
  // 他のオプション
  plugins: [
    // すべての Vue.js 警告コードを短絡します
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // デッドコード除去で縮小します
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // webpack 1 のみ - 発生回数別にモジュールIDを最適化します
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}
```

明らかに開発中にこの設定を使いたくないので、これにはいくつかの方法をとります:

1. 環境変数に基づいて構成オブジェクトを動的に構築します
2. または、開発用と運用用の2つの webpack 設定ファイルを使用します。[vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0) に示すように、3 つ目のファイルに共通のオプションをいくつか共有することもできます

目標を達成している限り、それはあなた次第です。
