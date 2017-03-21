# 自定义块

> 在大于 10.2.0 中支持

在 `.vue` 文件中，你可以自定义语言块。自定义块将会被 `vue-loader` 中配置的 `loaders` 处理，and then required by the component module。配置类似 [Advanced Loader Configuration](../configurations/advanced.md)，除了使用的是标签名称，而不是 `lang` 属性。

如果 loader 匹配到自定义块，它会被处理；其它情况会被忽略。

## 例子

这个例子是提取自定义块 `<docs>` 的内容到单个 docs 文件中：

#### component.vue

``` html
<docs>
## This is an Example component.
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
            // extract all <docs> content as raw text
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ]
  },
  plugins: [
    // output all docs into a single file
    new ExtractTextPlugin('docs.md')
  ]
}
```
