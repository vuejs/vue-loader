# プロダクションビルド

プロダクション用にバンドルを構築するときは二つのことをやります：

1. アプリケーションコードをミニファイルス
2. [Vue.jsガイドに記載されているセットアップの説明](https://vuejs.org/guide/deployment.html) を使ってVue.jsのソースコードから全ての警告を削除する

設定例を以下に示します：

``` js
// webpack.config.js
module.exports = {
  // ... 他のオプション
  plugins: [
    // すべてのVue.js警告コードを短絡する
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // デッドコード除去で縮小する
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // 発生回数別にモジュールIDを最適化する
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}
```

明らかに、開発中にこの設定を使いたくないので、これにはいくつかの方法をとります：

1. 環境変数に基づいて構成オブジェクトを動的に構築する；

2. または、開発用と運用用の2つのWebpack設定ファイルを使用する。[vue-hackernews-2.0]（https://github.com/vuejs/vue-hackernews-2.0）に示すように、3つ目のファイルに共通のオプションをいくつか共有することもできる。

目標を達成している限り、それはあなた次第です。
