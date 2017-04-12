# スコープ付き CSS

`scoped` 属性をもつ `<style>` タグを利用するとき、その CSS は現在のコンポーネントの要素にのみ適用されます。これは Shadow DOM のスタイルのカプセル化に似ています。いくつか注意点がありますが、polyfill は必要ありません。PostCSS を使用して以下を変換することによって実現しています:

``` html
<style scoped>
.example {
  color: red;
}
</style>

<template>
  <div class="example">hi</div>
</template>
```

以下の通りになります:

``` html
<style>
.example[_v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" _v-f3f3eg9>hi</div>
</template>
```

#### 注意

1. 同じコンポーネント内にスコープで区切られてものとそうでないスタイルを含むことが出来ます：

  ``` html
  <style>
  /* グローバルスタイル */
  </style>

  <style scoped>
  /* ローカルスタイル */
  </style>
  ```

2. 子コンポーネントのルートノードは親のスコープの CSS と子のスコープの CSS の両方の影響をうけます。

3. パーシャルはスコープ付きスタイルの影響をうけません。

4. **スコープされたスタイルは class の必要性を排除しません**。ブラウザが様々な CSS セレクタをレンダリングするため、`p { color: red }` はスコープされているとき何倍も遅くなります（すなわち属性セレクタと組み合わせた場合）。もし `.example { color: red }` のように class か id を使用するなら、パフォーマンスヒットは事実上なくなります。[この例](http://stevesouders.com/efws/css-selectors/csscreate.php)で違いをテストすることが出来ます。

5. **再帰されたコンポーネントの子孫セレクタには気をつけてください！** セレクタ `.a .b` を持つ CSS ルールの場合、`.a` にマッチする要素に再帰的な子コンポーネントが含まれている場合、その子コンポーネントのすべての `.b` はルールにマッチします。
