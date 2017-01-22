# スコープで区切られた CSS

`scoped` 属性をもつ `<style>` タグを利用するとき、そのCSSは現在のコンポーネントの要素に飲み手起用されます。これはShadow DOMのスタイルのカプセル化に似ています。いくつか注意点がありますが、polyfillは必要ありません。PostCSSを使用して以下を変換することによって実現しています。

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

#### Notes

1. 同じコンポーネント内にスコープで区切られてものとそうでないスタイルを含むことが出来ます：

  ``` html
  <style>
  /* global styles */
  </style>

  <style scoped>
  /* local styles */
  </style>
  ```

2. 子コンポーネントのルートノードは親のスコープのCSSと子のスコープのCSSの両方の影響をうけます。

3. パーシャルはスコープ付きスタイルの影響をうけません。

4. **スコープされたスタイルはclassの必要性を排除しません**。ブラウザが様々なCSSセレクタをレンダリングするため、`p { color: red }` はスコープされているとき何倍も遅くなります（すなわち属性セレクタと組み合わせた場合）。もし`.example { color: red }`のようにclassかidを使用するなら、パフォーマンスヒットは事実上なくなります。[この例]((http://stevesouders.com/efws/css-selectors/csscreate.php))で違いをテストすることが出来ます。

5. **再帰されたコンポーネントの子孫セレクタには気をつけてください！** セレクタ `.a .b`を持つCSSルールの場合、` .a`にマッチする要素に再帰的な子コンポーネントが含まれている場合、その子コンポーネントのすべての `.b`はルールにマッチします。
