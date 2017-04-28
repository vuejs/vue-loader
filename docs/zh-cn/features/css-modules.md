# CSS 模块

> 需要 ^9.8.0

[CSS 模块](https://github.com/css-modules/css-modules) 是一个用于模块化和组合 CSS的流行系统。`vue-loader` 提供了与 CSS 模块的一流集成，可以作为模拟 CSS 作用域的替代方案。

### 使用

在你的 `<style>` 上添加 `module` 属性：

``` html
<style module>
.red {
  color: red;
}
.bold {
  font-weight: bold;
}
</style>
```

这将为 `css-loader` 打开 CSS 模块模式，生成的 CSS 对象将为组件注入一个名叫 `$style` 的计算属性，你可以在你的模块中使用动态 class 绑定：

``` html
<template>
  <p :class="$style.red">
    This should be red
  </p>
</template>
```

由于它是一个计算属性，它也适用于 `:class` 的 object/array 语法：

``` html
<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      Am I red?
    </p>
    <p :class="[$style.red, $style.bold]">
      Red and bold
    </p>
  </div>
</template>
```

你也可以在 JavaScript 访问它：

``` html
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "_1VyoJ-uZOjlOxP7jWUy19_0"
    // an identifier generated based on filename and className.
  }
}
</script>
```

请参考 [CSS Modules spec](https://github.com/css-modules/css-modules) 了解更多详细信息 [global exceptions](https://github.com/css-modules/css-modules#exceptions) 和 [composition](https://github.com/css-modules/css-modules#composition).

### 自定义注入名称

在 `.vue` 中你可以定义不止一个 `<style>`，为了避免被覆盖，你可以通过设置 `module` 属性来为它们定义注入后计算属性的名称。

``` html
<style module="a">
  /* identifiers injected as a */
</style>

<style module="b">
  /* identifiers injected as b */
</style>
```

### 配置 `css-loader` Query

CSS 模块处理是通过 [css-loader](https://github.com/webpack/css-loader)。默认 query 如下：

``` js
{
  modules: true,
  importLoaders: true,
  localIdentName: '[hash:base64]'
}
```

你可以使用 `vue-loader` 的 `cssModules` 选项去为 `css-loader` 添加 query 配置：

``` js
// webpack 1
vue: {
  cssModules: {
    // overwrite local ident name
    localIdentName: '[path][name]---[local]---[hash:base64:5]',
    // enable camelCase
    camelCase: true
  }
}

// webpack 2
module: {
  rules: [
    {
      test: '\.vue$',
      loader: 'vue-loader',
      options: {
        cssModules: {
          localIdentName: '[path][name]---[local]---[hash:base64:5]',
          camelCase: true
        }
      }
    }
  ]
}
```
