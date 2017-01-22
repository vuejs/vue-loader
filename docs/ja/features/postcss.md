# PostCSS

`vue-loader`により処理されたCSSのアウトプットはスコープされたCSSにに書き換えるために[PostCSS](https://github.com/postcss/postcss) を通します。カスタムされた PostCSSプラグインをプロセスに追加することが出来ます。例えば、[autoprefixer](https://github.com/postcss/autoprefixer) や [CSSNext](http://cssnext.io/)があります。

Webpack 1.x の例：

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // use custom postcss plugins
    postcss: [require('postcss-cssnext')()]
  }
}
```

Webpack 2.x の例:

``` js
// webpack.config.js
module.exports = {
  // other options...
  module: {
    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // vue-loader options goes heres
        options: {
          // ...
          postcss: [require('postcss-cssnext')()]
        }
      }
    ]
  }
}
```

加えてpluginの配列を提供し、`postcss` オプションは以下も受け入れます：

- プラグインの配列を返す関数；

- PostCSSプロセッサに渡すオプションを含むオブジェクト。これは、カスタム parser/stringifiers に依存するPostCSSプロジェクトを使用している場合に便利です。

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: sugarss // use sugarss parser
    }
  }
  ```
