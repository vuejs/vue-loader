# オプションリファレンス

## Webpack 1 と 2 の使い方の違い

Webpack 2 の場合: オプションを loader ルールに直接渡します。

``` js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // vue-loader オプション
        }
      }
    ]
  }
}
```

Webpack 1.x の場合: Webpack の設定のルートに `vue` ブロックを追加します。

``` js
module.exports = {
  // ...
  vue: {
    // vue-loader オプション
  }
}
```

### loaders

- 型: `{ [lang: string]: string }`

  `* .vue` ファイル内の言語ブロックに使用されるデフォルトの loader を上書きする Webpack loader を指定するオブジェクト。キーは指定されている場合、言語ブロックの `lang` 属性に対応します。各タイプのデフォルトの `lang` は次のとおりです:

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  たとえば、`babel-loader` と `eslint-loader` を使ってすべての `<script>` ブロックを処理するには:

  ``` js
  // Webpack 2.x config
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader!eslint-loader'
          }
        }
      }
    ]
  }
  ```

### preLoaders

- 型: `{ [lang: string]: string }`
- 10.3.0 以上でサポートされます。

  config 形式は `loaders` と同じですが、`preLoaders` はデフォルト loader の前に対応する言語ブロックに適用されます。これを使用して言語ブロックを前処理することができます。一般的な使用例としては、i18n のビルド時です。

### postLoaders

- 型: `{ [lang: string]: string }`
- 10.3.0 以上でサポートされます。

  config 形式は `loaders` と同じですが、` postLoaders` はデフォルト loader の後に適用されます。これを使用して言語ブロックを後処理することができます。ただしこれは少し複雑になります:

  - `html` の場合、デフォルトの loader によって返される結果は、コンパイルされた JavaScript レンダリング関数コードになります。
  - `css` の場合、結果は` vue-style-loader` によって返されます。これはほとんどの場合特に有用ではありません。postcss プラグインを使用する方が良いでしょう。

### postcss

  > メモ: 11.0.0 以上では代わりに PostCSS の設定ファイル推奨されています。[使用法は `postcss-loader` と同じです](https://github.com/postcss/postcss-loader#usage)。

- 型: `Array` もしくは `Function` か `Object`

  カスタムした PostCSS プラグインを `*.vue` ファイル内の CSS に適用するよう指定します。もし関数を使用しているなら、この関数は同じ loader のコンテキストを使用して呼び出され、プラグインの配列を返す必要があります。

  ``` js
  // ...
  {
    loader: 'vue-loader',
    options: {
      // 注意： `loaders` 以下に `postcss` のオプションをネストさせてはいけません
      postcss: [require('postcss-cssnext')()],
      loaders: {
        // ...
      }
    }
  }
  ```

  そのオプションは PostCSS プロセッサーに渡すオプションを含むオブジェクトにすることもできます。これは カスタムされたパーサー/文字列化に依存した PostCSS プロジェクトを使用しているとき便利です:

  ``` js
  postcss: {
    plugins: [...], // pluginsのリスト
    options: {
      parser: sugarss // sugarss パーサを使用
    }
  }
  ```

### cssSourceMap

- 型: `Boolean`
- デフォルト: `true`

  CSS のソースマップを有効にするかどうか。これを無効にすると、`css-loader` の相対パス関連のバグを避けることができ、ビルドを少し早くすることができます。

  注意: もしメインの Webpack の設定に `devtool` オプションが存在しないければオートで `false` にセットされます。

### esModule

- 型: `Boolean`
- デフォルト: `undefined`

  esModule 互換コードを発行するかどうか。デフォルトの vue-loader のデフォルトの出力は `module.exports = ....` のような commonjs 形式で発行します。 `esModule` が true にセットされているとき、デフォルトの出力は `exports.__esModule = true; exports = ...` にトランスパイルされます。TypeScript のような Babel 以外の transpiler との相互運用に役立ちます。

### preserveWhitespace

- 型: `Boolean`
- デフォルトx: `true`

  もし `false` に設定されていたら、テンプレート内の HTML タグ間の空白は無視されます。

### transformToRequire

- 型: `{ [tag: string]: string | Array<string> }`
- デフォルト: `{ img: 'src', image: 'xlink:href' }`

  テンプレートのコンパイル中、コンパイラは `src` の URL のような特定の属性を `require` 呼び出しに変換することができます。これによりターゲットの asset を Webpack が処理できるようになります。デフォルトの設定は `<img>` タグの `src` 属性と SVG の `<image>` タグの `xlink:href` 属性を変換します。

### buble

  型: `Object`
  デフォルト: `{}`

  `bubble-loader`(存在する場合)のオプションとテンプレートレンダリング関数のための buble のコンパイルパスを設定します。

  > バージョンメモ: 9.x では、テンプレート式は削除された `templateBuble` オプションによって別々に設定されます。

  このテンプレートレンダリング関数のコンパイルでは、特別な変換 `stripWidth` (デフォルトで有効)がサポートされ、生成されたレンダリング関数で `with` の使用法が削除され、strict-mode に準拠します。

  設定の例:

  ``` js
  // webpack 1
  vue: {
    buble: {
      // オブジェクトスプレッド演算子を有効にする
      // メモ: Object.assign polyfillを自分で提供する必要があります！
      objectAssign: 'Object.assign',

      // `with` の除去をオフにする
      transforms: {
        stripWith: false
      }
    }
  }

  // webpack 2
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          buble: {
            // 同じオプション
          }
        }
      }
    ]
  }
  ```
