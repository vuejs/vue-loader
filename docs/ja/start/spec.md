# Vue Component の仕様

`*.vue` ファイルは HTML のような構文を使用して Vue コンポーネントを記述するカスタムファイルフォーマットです。各 `*.vue` ファイルは `<template>`、`<script>`、`<style>` の三つのトップレベル言語のブロックで構成されています。

``` html
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>

<custom1>
  例えばコンポーネントのドキュメントを書くことが出来ます
</custom1>
```

`vue-loader` はファイルを解析し、それぞれの言語ブロックを必要に応じて他の loader を通し、最終的に `module.exports` が Vue.js のコンポーネントオプションオブジェクトの CommonJS モジュールに変換します。

`vue-loader` は CSS プリプロセッサや HTML にコンパイルするテンプレート言語といった、デフォルトでない言語を言語ブロックの `lang` 属性を使用することでサポートします。例えばコンポーネントのスタイルに SASS を使用することが出来ます。

``` html
<style lang="sass">
  /* SASS で書きます! */
</style>
```
詳細は [プリプロセッサの仕様](../configurations/pre-processors.md) で確認することが出来ます。

### 言語ブロック

#### `<template>`

- デフォルトの言語は `html`
- それぞれの `*.vue` ファイルは最大で一つの `<template>` ブロックを含みます
- 内容は文字列に展開され、コンパイルされた Vue コンポーネントの `template` オプションで使用されます

#### `<script>`

- デフォルトの言語は `js`（`babel-loader` や `buble-loader` が検出される場合、自動的にES2015がサポートされる）
- それぞれの `*.vue` ファイルは最大で一つの `<script>` ブロックを含みます
- スクリプトは CommonJS のように処理されます（ Webpack 経由でバンドルされた通常の `.js` モジュールと同じです）。つまり他の依存関係を `recuire()` することができます。そして ES2015 がサポートされ、`import` と `export` 構文を使用することが出来ます
- スクリプトは Vue.js コンポーネントのオプションオブジェクトをエクスポートする必要があります。 `Vue.extend()` によって拡張されたコンストラクタもエクスポートすることが可能ですが、プレーンなオブジェクトが好ましいです

#### `<style>`

- デフォルトの言語は `css`
- 複数の `<style>` タグは単一の `*.vue` ファイルでサポートされます
- `<style>` タグは `scoped` か `module` （詳しくは [Scoped CSS](../features/scoped-css.md) と [CSS Modules](../features/css-modules.md) をみてください）を使用してコンポーネントにスタイルをカプセル化する事が出来ます。異なるカプセルモードをもつ複数の `<style>` タグは同じコンポーネント内で混在させることが出来ます
- デフォルトではコンテンツは `style-loader` を使用して実際の `<style>` タグとして抽出され、ドキュメントの `<head>` に動的に挿入されます。また、[すべてのコンポーネントのすべてのスタイルが単一のCSSファイルに抽出されるようにWebpackを設定する](../configurations/extract-css.md)ことも出来ます

### カスタムブロック

> vue-loader 10.2.0+ でのみサポートされます

例えば `<docs>` ブロックのように、プロジェクトの特別な必用に応じて `*.vue` ファイルに カスタムブロックを追加することが出来ます。 `vue-loader`はタグ名を使用してセクションの内容に適用されるべき webpack loader を検索します。webpack loader は、`vue-loader` オプションの `loaders` セクションで指定する必要があります。

このモードの詳細については、[カスタムブロック](../configurations/custom-blocks.md)を参照してください。

### ソースのインポート

もし `*.vue` コンポーネントを複数のファイルに分割したい場合は、`src` 属性を使って言語ブロック用の外部ファイルをインポートすることが出来ます:

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

`src` のインポートは CommonJS の `require()` 呼び出しと同じパス解決規則に従うことに注意してください。相対パスは `./` で始める必要があり、インストールされた NPM パッケージから直接リソースをインポートすることができます:

``` html
<!-- インストールされた "todomvc-app-css" npm パッケージ からファイルをインポートします-->
<style src="todomvc-app-css/index.css">
```

`src` によるインポートはカスタムブロックでも動作します、例:

``` html
<unit-test src="./unit-test.js">
</unit-test>
```

### シンタックスハイライト

現在それらはシンタクスハイライトをサポートしているのは、[Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), [JetBrains products](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm, etc). 他のエディタ/IDEへのコントリビュートは高く評価されます！もし Vue コンポーネント内でプリプロセッサを使用していない場合は、エディタで `*.vue` ファイルを HTML として扱うことが出来ます。

### コメント

それぞれのブロック内でそれぞれの言語のコメントシンタックスを使用することが出来る (HTML、CSS、JavaScript、Jade、etc) 。最上部のコメントは HTML コメントシンタックスを使用してください: `<!-- コメントはこちら -->`
