# カスタムブロック

> 10.2.0 以上で動作します

`*.vue` ファイル内にカスタム言語ブロックを定義することが出来ます。カスタムブロックの内容は `vue-loader` のオブジェクトで指定された loader によって処理され、次にコンポーネントモジュールによって要求されます。この設定は `lang` 属性の代わりにタグ名を使用する点をのぞいて[高度な loader の設定](../configurations/advanced.md)に記載されたものと似ています。

もしカスタムブロックにマッチする loader を見つけたら、それは処理されます。でなければそのカスタムブロックは単に無視されます。

## 例

全ての `<docs>` カスタムブロックを一つのドキュメントファイルに展開する例を示します：

#### component.vue

``` html
<docs>
## これは example component です
</docs>

<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>

<style>
comp-a h2 {
  color: #f00;
}
</style>
```

#### webpack.config.js

``` js
// Webpack 2.x
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          loaders: {
            // 全ての <docs> の内容は raw text として展開されます
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ]
  },
  plugins: [
    // 全ての docs は一つのファイルに出力されます
    new ExtractTextPlugin('docs.md')
  ]
}
```
