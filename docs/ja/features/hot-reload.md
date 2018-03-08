# ホットリロード

"ホットリロード"はファイルを編集するときに単にページをリロードするだけではありません。ホットリロードを有効にすると、`*.vue` ファイルを編集するとき、すべてのコンポーネントのインスタンスは **ページのリロードをせずに** 取り替えられます。アプリの現在の状態を保持し、コンポーネントを取り替えることが出来ます！これはコンポーネントのテンプレートやスタイリングを微調整するときの開発体験を劇的に改善します。

![hot-reload](http://blog.evanyou.me/images/vue-hot.gif)

`vue-cli` を使ってプロジェクトをスキャホールドすると、ホットリロードはすぐに使えるようになります。

## Disabling Hot Reload

Hot Reload is always enabled except following situations:

 * Webpack `target` is `node` (SSR)
 * Webpack minifies the code
 * `process.env.NODE_ENV === 'production'`
  
You may use `hotReload: false` option to disable the Hot Reload explicitly:

``` js
module: {
  rules: [
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        hotReload: false // disables Hot Reload
      }
    }
  ]
}
```
