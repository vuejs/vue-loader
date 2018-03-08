# PostCSS

`vue-loader`により処理されたCSSのアウトプットはスコープされたCSSに書き換えるために[PostCSS](https://github.com/postcss/postcss) を通します。カスタムされた PostCSSプラグインをプロセスに追加することが出来ます。例えば、[autoprefixer](https://github.com/postcss/autoprefixer) や [CSSNext](http://cssnext.io/)があります。

## 設定ファイルの使用

`vue-loader` は [`postcss-loader`](https://github.com/postcss/postcss-loader#usage) でサポートされているものと同じ PostCss の設定ファイルのオートロードをサポートします:

- `postcss.config.js`
- `.postcssrc`
- `package.json` 内の `postcss`

設定ファイルを使用すると `postcss-loader` で処理された通常の CSS ファイルと `*.vue` ファイル内の CSS で同じ設定を共有することができます。

## Using with `postcss-loader`

Since `vue-loader` handles PostCSS on its styles internally, you only need to apply `postcss-loader` to standalone CSS files. There's no need to specify `lang="postcss"` on a style block if there is a PostCSS config file in your project.

Sometimes the user may want to use `lang="postcss"` only for syntax highlighting purposes. Starting in 13.6.0, if no loader has been explicitly configured for the following common PostCSS extensions (via `vue-loader`'s own `loaders` option), they will simply go through `vue-loader`'s default PostCSS transforms:

- `postcss`
- `pcss`
- `sugarss`
- `sss`

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
      parser: 'sugarss' // sugarss パーサーを使用します
    }
  }
  ```

### Disabling Auto Config File Loading

In `13.6.0+`, auto postcss config file loading can be disabled by specifying `postcss.useConfigFile: false`:

``` js
postcss: {
  useConfigFile: false,
  plugins: [/* ... */],
  options: {/* ... */}
}
```

This allows the postcss configuration inside `*.vue` files to be entirely controlled by the inline config.
