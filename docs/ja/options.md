# オプションリファレンス

## webpack 1 と 2 の使い方の違い

webpack 2 の場合: オプションを loader ルールに直接渡します。

``` js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `vue-loader` オプション
        }
      }
    ]
  }
}
```

webpack 1.x の場合: webpack の設定のルートに `vue` ブロックを追加します。

``` js
module.exports = {
  // ...
  vue: {
    // `vue-loader` オプション
  }
}
```

### loaders

- 型: `{ [lang: string]: string }`

  `* .vue` ファイル内の言語ブロックに使用されるデフォルトの loader を上書きする webpack loader を指定するオブジェクト。キーは指定されている場合、言語ブロックの `lang` 属性に対応します。各タイプのデフォルトの `lang` は次のとおりです:

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  たとえば、`babel-loader` と `eslint-loader` を使ってすべての `<script>` ブロックを処理するには:

  ``` js
  // webpack 2.x config
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
- 10.3.0 以降でサポートされます。

  config 形式は `loaders` と同じですが、`preLoaders` はデフォルト loader の前に対応する言語ブロックに適用されます。これを使用して言語ブロックを前処理することができます。一般的な使用例としては、i18n のビルド時です。

### postLoaders

- 型: `{ [lang: string]: string }`
- 10.3.0 以降でサポートされます。

  config 形式は `loaders` と同じですが、` postLoaders` はデフォルト loader の後に適用されます。これを使用して言語ブロックを後処理することができます。ただしこれは少し複雑になります:

  - `html` の場合、デフォルトの loader によって返される結果は、コンパイルされた JavaScript レンダリング関数コードになります。
  - `css` の場合、結果は` vue-style-loader` によって返されます。これはほとんどの場合特に有用ではありません。PostCSS プラグインを使用する方が良いでしょう。

### postcss

  > メモ: 11.0.0 以降では代わりに PostCSS の設定ファイル推奨されています。[使用法は `postcss-loader` と同じです](https://github.com/postcss/postcss-loader#usage)。

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

### postcss.config

> 13.2.1 で新規追加

- 型: `Object`
- デフォルト: `undefined`

  このフィールドは、[postcss-loader](https://github.com/postcss/postcss-loader#config-1) と同じ方法で PostCSS の設定をカスタマイズできます。

  - **postcss.config.path**

    PostCSS 設定ファイルを読み込むパス(ファイルまたはディレクトリ)を指定します。

    ``` js
    postcss: {
      config: {
        path: path.resolve('./src')
      }
    }
    ```

  - **postcss.config.ctx**

    PostCSS プラグインにコンテキストを提供します。より詳細については、[postcss-loader のドキュメント](https://github.com/postcss/postcss-loader#context-ctx) を参照してください。

### cssSourceMap

- 型: `boolean`
- デフォルト: `true`

  CSS のソースマップを有効にするかどうか。これを無効にすると、`css-loader` の相対パス関連のバグを避けることができ、ビルドを少し早くすることができます。

  注意: もしメインの webpack の設定に `devtool` オプションが存在しないければオートで `false` にセットされます。

### esModule

- 型: `boolean`
- デフォルト: `true` (v13.0以降)

  esModule 互換コードを発行するかどうか。デフォルトの vue-loader のデフォルトの出力は `module.exports = ....` のような commonjs 形式で発行します。 `esModule` が true にセットされているとき、デフォルトの出力は `exports.__esModule = true; exports = ...` にトランスパイルされます。TypeScript のような Babel 以外の transpiler との相互運用に役立ちます。

  > バージョンメモ: v12.x までは、デフォルトは `false` です。

### preserveWhitespace

- 型: `boolean`
- デフォルト: `true`

  もし `false` に設定されていたら、テンプレート内の HTML タグ間の空白は無視されます。

### compilerModules

- 型: `Array<ModuleOptions>`
- デフォルト: `[]`

  `vue-template-compiler` の `modules` オプションを設定します。詳細については `vue-template-compiler` の [`modules` option](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options) を参照してください。

### compilerDirectives

- 型: `{ [tag: string]: Function }`
- デフォルト: `{}` (v13.0.5 以降)

  > バージョンメモ: v12.x においては、v12.2.3 以降からサポートされます。

  `vue-template-compiler` の `directives` オプションを設定します。詳細については `vue-template-compiler` の [`directives` option](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options) を参照してください。

### transformToRequire

- 型: `{ [tag: string]: string | Array<string> }`
- デフォルト: `{ img: 'src', image: 'xlink:href' }`

  テンプレートのコンパイル中、コンパイラは `src` の URL のような特定の属性を `require` 呼び出しに変換することができます。これによりターゲットの asset を webpack が処理できるようになります。デフォルトの設定は `<img>` タグの `src` 属性と SVG の `<image>` タグの `xlink:href` 属性を変換します。

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

### extractCSS

  > 12.0.0 で追加

  - 型: `boolean`
  - デフォルト: `false`

  自動的に `extract-text-webpack-plugin` を使用して CSS を抽出します。ほとんどのプリプロセッサに対してすぐに動作し、本番環境においても同様に圧縮 (minify) 処理します。

  `true` またはプラグインのインスタンス (複数の抽出されたファイルに対して `extract-text-webpack-plugin` の複数のインスタンスを使用できるように) を値として渡すことができます。

  これは、開発中にはホットリロードが動作するため本番環境でのみ使用する必要があります。

  例:

  ``` js
  // webpack.config.js
  var ExtractTextPlugin = require("extract-text-webpack-plugin")

  module.exports = {
    // 他のオプション ...
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            extractCSS: true
          }
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin("style.css")
    ]
  }
  ```

  または、プラグインのインスタンスを渡します:

  ``` js
  // webpack.config.js
  var ExtractTextPlugin = require("extract-text-webpack-plugin")
  var plugin = new ExtractTextPlugin("style.css")

  module.exports = {
    // 他のオプション ...
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            extractCSS: plugin
          }
        }
      ]
    },
    plugins: [
      plugin
    ]
  }
  ```

### optimizeSSR

> 12.1.1 で新規追加

- 型: `boolean`
- デフォルト: webpack 設定が `target: 'node'` でかつ `vue-template-compiler` が バージョン 2.4.0 以上であれば、`true`

描画 (render) 関数によって返された vdom ツリーの一部をプレーンな文字列にコンパイルする、Vue 2.4 SSR (サーバサイドレンダリング) のコンパイル最適化を有効にして、SSR のパフォーマンスを改善します。
描画関数の結果が SSR のみを対象としたものになり、クライアントサイドレンダリングまたはテストには使用できなくなるため、あるケースによっては、明示的にオフにしたくなる場合があります。
