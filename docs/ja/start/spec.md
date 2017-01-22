# Vue Component の仕様

`*.vue` ファイルはHTMLライクな構文を使用して Vue コンポーネントを記述するカスタムファイルフォーマットです。各 `*.vue` ファイルは`<template>` `<script>` `<style>`の三つのトップレベル言語のブロックで構成されています。

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
```

`vue-loader` はファイルを解析し、それぞれの言語ブロックを必要に応じて他の loader を通し、最終的に `module.exports` が Vue.js のコンポーネントオプションオブジェクト の CommonJS モジュールに変換します。

`vue-loader` はCSS プリプロセッサやHTMLにコンパいるするテンプレート言語といった、デフォルトでない言語を言語ブロックの `lang` 属性を使用することでサポートします。例えば次のようにコンポーネントのスタイルに SASSを使用することが出来ます。

``` html
<style lang="sass">
  /* write SASS! */
</style>
```
詳細は [プリプロセッサの仕様](../configurations/pre-processors.md) で確認することが出来ます。

### 言語ブロック

#### `<template>`

- デフォルトは `html`

- それぞれの `*.vue` ファイルは最大で一つの `<template>` ブロックを含む。

- 内容は文字列に展開され、コンパイルされた Vue コンポーネントの `template` オプションで使用される。

#### `<script>`

- デフォルトは `js`（`babel-loader` や `buble-loader' が検出される場合、自動的にES2015がサポートされる）

- それぞれの `*.vue` ファイルは最大で一つの `<script>` ブロックを含む。

- スクリプトは CommonJS のように処理される（Webpack 経由でバンドルされた通常の `.js` モジュールと同じです）。つまり他の依存関係を `recuire()` することができる。そして ES2015 をサポートされ、`import` と `export` 構文を使用することが出来る。

- スクリプトは Vue.js コンポーネントのオプションオブジェクトをエクスポートする必要があります。 'Vue.extend()' によって拡張されたコンストラクタもエクスポートすることが可能ですが、プレーンなオブジェクトが優先される。

#### `<style>`

- デフォルトは `css`。

- 複数の `<style>` タグは単一の `*.vue` ファイルでサポートされる。

- `<style>` タグは `scoped`か`module` （詳しくは [Scoped CSS](../features/scoped-css.md) と [CSS Modules](../features/css-modules.md) をみてください）を使用してコンポーネントにスタイルをカプセル化する事が出来る。異なるカプセルモードをもつ複数の`<style>` タグは同じコンポーネント内で混在させることが出来る。

- デフォルトではコンテンツは `style-loader` を使用して実際の `<style>` タグとして抽出され、ドキュメントの `<head>` に動的に挿入される。また、[すべてのコンポーネントのすべてのスタイルが単一のCSSファイルに抽出されるようにWebpackを設定する]（../ configurations / extract-css.md)こともできる。

### ソースのインポート

もし `*.vue` コンポーネントを複数のファイルに分割したい場合は、 `src` 属性を使って言語ブロック用の外部ファイルをインポートすることが出来ます。

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

`src`のインポートはCommonJSの `require（）` 呼び出しと同じパス解決規則に従うことに注意してください。相対パスは`./`で始める必要があり、インストールされたNPMパッケージから直接リソースをインポートすることができます。

``` html
<!-- import a file from the installed "todomvc-app-css" npm package -->
<style src="todomvc-app-css/index.css">
```

### シンタックスハイライト

現在それらはシンタクスハイライトをサポートしているのは、 [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), [JetBrains products](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm, etc). 他のエディタ/IDEへのコントリビュートは高く評価されます！もしVue コンポーネント内でプリプロセッサを使用していない場合は、エディタで`*.vue`ファイルをHTMLとして扱うことが出来ます。

### コメント

それぞれのブロック内でそれぞれの言語のコメントシンタックスを使用することが出来る（HTML、CSS、JavaScript、Jade、etc...）。最上部のコメントはHTMLコメントシンタックスを使用してください： `<!-- コメントはこちら -->`
