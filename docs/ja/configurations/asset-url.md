# アセット URL ハンドリング

デフォルトで `vue-loader` は [css-loader](https://github.com/webpack/css-loader) と Vue テンプレートコンパイラーでスタイルとテンプレートファイルは自動で処理されます。このコンパイル処理中で全ての `<img src="...">` 、`background: url(...)` や CSS の `@import` のようなアセットの URL は **モジュールの依存関係として処理されます**。

例えば、`url(./image.png)` は `require('./image.png')` に変換され、そして

``` html
<img src="../image.png">
```

このようにコンパイルされます:

``` js
createElement('img', { attrs: { src: require('../image.png') }})
```

### Transform Rules

- If the URL is an absolute path (e.g. `/images/foo.png`), it will be preserved as-is.

- If the URL starts with `.`, it's interpreted as a relative module request and resolved based on the folder structure on your file system.

- If the URL starts with `~`, anything after it is interpreted as a module request. This means you can even reference assets inside node modules:

  ``` html
  <img src="~/some-npm-package/foo.png">
  ```

- (13.7.0+) If the URL starts with `@`, it's also interpreted as a module request. This is useful if your webpack config has an alias for `@`, which by default points to `/src` in any project created by `vue-cli`.

### Related Loaders

もちろん `.png` ファイルは JavaScript のファイルではありません。[file-loader](https://github.com/webpack/file-loader) または [url-loader](https://github.com/webpack/url-loader) を使用して webpack を設定する必要があります。`vue-cli` でスキャフォールドされたプロジェクトでは同じような設定がなされています。

### Why

利点の全ては次の通りです:

1. `file-loader` はアセットファイルのコピー先や配置先を制定したり、バージョンハッシュを利用してキャッシングを改善する方法を指定する事が出来ます。さらに、これは、単に**あなたの `* .vue` ファイルの隣にイメージを置くことができ、配備するURLを心配するのではなくフォルダ構造に基づいて相対パスを使用する**ことを意味します。
2. `url-loader` は、指定されたしきい値よりも小さい場合、条件付きでファイルを base-64 データ URL としてインライン化することができます。これにより、単純なファイルに対する HTTP リクエストの量を減らすことができます。 ファイルがしきい値より大きい場合、自動的に `file-loader` にフォールバックします。
