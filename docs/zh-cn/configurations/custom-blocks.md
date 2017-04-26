# 自定义块

> 在大于 10.2.0 中支持

在 `.vue` 文件中，你可以自定义语言块。自定义块的内容将由 `vue-loader` 的 options 中的 `loader` 对象中指定的 loader 处理，然后被组件模块依赖。类似 [Loader 进阶配置](../configurations/advanced.md)中的配置，但使用的是标签名匹配，而不是 `lang` 属性。

如果找到一个自定义块的 matching loader，该自定义块将被处理; 否则自定义块将被忽略。
另外，如果找到的 loader 返回一个函数，该函数将以 `* .vue` 文件的组件作为参数来调用。

## 例子

这是提取自定义块 `<docs>` 的内容到单个 docs 文件中的例子：

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
            // 提取 <docs> 中的内容为原始文本
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ]
  },
  plugins: [
    // 输出 docs 到当个文件中
    new ExtractTextPlugin('docs.md')
  ]
}
```
