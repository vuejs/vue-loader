# 自定义块

在 `.vue` 文件中，你可以自定义语言块。应用于一个自定义块的 loader 是基于这个块的 `lang` 特性、块的标签名以及你的 webpack 配置进行匹配的。

如果指定了一个 `lang` 特性，则这个自定义块将会作为一个带有该 `lang` 扩展名的文件进行匹配。

你也可以使用 `resourceQuery` 来为一个没有 `lang` 的自定义块匹配一条规则。例如为了匹配自定义块 `<foo>`：

``` js
{
  module: {
    rules: [
      {
        resourceQuery: /blockType=foo/,
        loader: 'loader-to-use'
      }
    ]
  }
}
```

如果找到了一个自定义块的匹配规则，它将会被处理，否则该自定义块会被默默忽略。

此外，如果这个自定义块被所有匹配的 loader 处理之后导出一个函数作为最终结果，则这个 `*.vue` 文件的组件会作为一个参数被这个函数调用。

## Example

这里有一个向组件内注入 `<docs>` 自定义块的示例，且它是在运行时可用的。

为了注入自定义块的内容，我们将会撰写一个自定义 loader：

``` js
module.exports = function (source, map) {
  this.callback(
    null,
    `export default function (Component) {
      Component.options.__docs = ${
        JSON.stringify(source)
      }
    }`,
    map
  )
}
```

现在我们将会配置 webpack 来使用为 `<docs>` 自定义块撰写的自定义 loader。

``` js
// wepback.config.js
module.exports = {
  module: {
    rules: [
      {
        resourceQuery: /blockType=docs/,
        loader: require.resolve('./docs-loader.js')
      }
    ]
  }
}
```

现在我们可以在运行时访问被导入组件的 `<docs>` 块内容了。

``` vue
<!-- ComponentB.vue -->
<template>
  <div>Hello</div>
</template>

<docs>
This is the documentation for component B.
</docs>
```

``` vue
<!-- ComponentA.vue -->
<template>
  <div>
    <ComponentB/>
    <p>{{ docs }}</p>
  </div>
</template>

<script>
import ComponentB from './ComponentB.vue';

export default = {
  components: { ComponentB },
  data () {
    return {
      docs: ComponentB.__docs
    }
  }
}
</script>
```
