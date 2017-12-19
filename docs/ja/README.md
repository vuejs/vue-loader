# はじめに

### `vue-loader` とは ?

`vue-loader` とは以下の形式で記述された Vue コンポーネントをプレーンな JavaScript モジュールに変換する webpack の loader です。

![screenshot](http://blog.evanyou.me/images/vue-component.png)

`vue-loader` によって多くのクールな機能が提供されます:

- デフォルトで ES2015 が有効
- `<style>` には SASS、 `<template>` には Jade など、Vue コンポーネントの各パーツに他の webpack の loader が使用可能、カスタム loader チェーンを適用できる .vue ファイルのカスタムセクションを追加可能
- `<style>` と `<template>` で参照される静的なアセットをモジュールの依存として扱い、webpack の loader で処理可能
- 各コンポーネントで scoped CSS をシミュレートすることが可能
- 開発時のコンポーネントのホットリロードをサポート

つまり、webpack と `vue-loader` の組み合わせは Vue.js アプリケーションを作成するための、現代的で柔軟かつとても強力なフロントエンドワークフローを実現することが可能になります。

### webpack とは?

すでに webpack に精通している場合は、次の説明を省略してもかまいません。しかし、webpack を初めて使う人のために、ここで簡単な紹介を行います。

[webpack](http://webpack.github.io/) とはモジュールのバンドラーです。それぞれのファイルをモジュールとして扱い、それらの間の依存関係を解決し、デプロイの準備が整った静的アセットにバンドルします。

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

基本的な例として、CommonJS モジュールが多数あるとします。これらはブラウザで直接実行できません。なのでそれらを `<script>` タグを介して読み込むことのできる単一のファイルに "バンドル" する必要があります。webpack は `require()` での依存性解決と実行を行うことが出来ます。

しかし webpack はそれ以上のことが出来ます。 "loader" を用いることで、最終的なバンドルしたファイルを出力する前に webpack に様々な方法で全てのタイプのファイルを変換できるように設定することが出来ます。いくつかの例をあげると：

- ES2015、CoffeeScript、TypeScript のモジュールをプレーンな ES5 の CommonJS モジュールにトランスパイル
- オプションでコンパイルを行う前にソースコードを linter に通すことが可能
- Jade テンプレートをプレーンな HTML にトランスパイルし、JavaScript の文字列として展開
- SASS ファイルをプレーンな CSS にトランスパイルし、`<style>` タグとして挿入する JavaScript スニペットに変換
- HTML または CSS で参照されるイメージファイルを処理し、パスの設定に基づいた目的の場所に移動し、md5 ハッシュを使用して名前付け

webpack は非常に強力です。どのように動作するか理解すれば、フロントエンド開発のワークフローを劇的に向上させることが出来ます。欠点としては冗長で複雑な構成です。しかし、このガイドでは Vue.js と `vue-loader` での webpack を使用する際に一般的な問題の解決策を見つけることができるはずです。
