# はじめに

### `vue-loader` とは ?

`vue-loader` とは以下の形式で記述された Vue コンポーネントをプレーンな JavaScript モジュールに変換する Webpack の loader です。

![screenshot](http://blog.evanyou.me/images/vue-component.png)

`vue-loader` によって多くのクールな機能が提供されます：

- デフォルトで ES2015 が有効 ;
- `<style>` には SASS、 `<template>` には Jade など、Vue コンポーネントの各パーツに他の Webpack の loader が使用可能 ;
- `<style>と` <template> `で参照される静的なアセットをモジュールの依存として扱い、Webpack の loader で処理可能 ;
- 各コンポーネントで scoped CSS をシミュレートすることが可能 ;
- 開発時のコンポーネントのホットリロードをサポート

要するに、Webpack と `vue-loader` の組み合わせは Vue.js アプリケーションを作成するための、モダンで柔軟かつとても強力なフロントエンドワークフローを実現することが出来ます。

### Webpack とは?

すでにWebpackに精通している場合は、次の説明を省略してもかまいません。しかし、Webpackを初めて使う人のために、ここに簡単な紹介を行います。

[Webpack](http://webpack.github.io/) とはモジュールのバンドラーです。それぞれのファイルをモジュールとして扱い、それらの間の依存関係を解決し、デプロイの準備が整った静的アセットにバンドルします。

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

基本的な例として、CommonJS モジュールが多数あるとします。これらはブラウザで直接実行できません。なのでそれらを `<script>`タグを介して読み込むことのできる単一のファイルに "バンドル"する必要があります。Webpackは `require()`での依存性解決と実行を行うことが出来ます。

しかし Webpack はそれ以上のことが出来ます。 "loader" を用いることで、 最終的なバンドルしたファイルを出力する前にWebpackに様々な方法で全てのタイプのファイルを変換できるように設定することが出来ます。幾つかの例をあげると：

- ES2015、CoffeeScript、TypeScriptのモジュールをプレーンなES5のCommonJS モジュールにトランスパイル；
- オプションでコンパイルを行う前にソースコードを linter に通すことが可能；
- Jade テンプレートをプレーンな HTML にトランスパイルし、JavaScriptの文字列としてに展開；
- SASS ファイルをプレーンなCSSにトランスパイルし、`<style>`  タグとして挿入する JavaScript スニペットに変換；
- HTML または CSS で参照されるイメージファイルを処理し、パスの設定に基づいた目的の場所に移動し、md5 ハッシュを使用して名前付け；

Webpack は非常に強力です。どのように動作するか理解すれば、フロントエンド開発のワークフローを劇的に向上させることが出来ます。欠点としては冗長で複雑な構成です。しかし、このガイドでは Vue.js と `Vue-loader` での Webpack を使用する際に一般的な問題の解決策を見つけることができるはずです。