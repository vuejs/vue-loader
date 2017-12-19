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
もちろん `.png` ファイルは JavaScript のファイルではありません。[file-loader](https://github.com/webpack/file-loader) または [url-loader](https://github.com/webpack/url-loader) を使用して webpack を設定する必要があります。`vue-cli` でスキャフォールドされたプロジェクトでは同じような設定がなされています。

利点の全ては次の通りです:

1. `file-loader` はアセットファイルのコピー先や配置先を制定したり、バージョンハッシュを利用してキャッシングを改善する方法を指定する事が出来ます。さらに、これは、単に**あなたの `* .vue` ファイルの隣にイメージを置くことができ、配備するURLを心配するのではなくフォルダ構造に基づいて相対パスを使用する**ことを意味します。
2. `url-loader` は、指定されたしきい値よりも小さい場合、条件付きでファイルを base-64 データ URL としてインライン化することができます。これにより、単純なファイルに対する HTTP リクエストの量を減らすことができます。 ファイルがしきい値より大きい場合、自動的に `file-loader` にフォールバックします。
