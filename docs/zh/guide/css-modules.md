# CSS Modules

[CSS Modules](https://github.com/css-modules/css-modules) 是一个流行的，用于模块化和组合 CSS 的系统。`vue-loader` 提供了与 CSS Modules 的一流集成，可以作为模拟 scoped CSS 的替代方案。

## 用法

首先，CSS Modules 必须通过向 `css-loader` 传入 `modules: true` 来开启：

``` js
// webpack.config.js
{
  module: {
    rules: [
      // ... 其它规则省略
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              // 开启 CSS Modules
              modules: true,
              // 自定义生成的类名
              localIdentName: '[local]_[hash:base64:8]'
            }
          }
        ]
      }
    ]
  }
}
```

然后在你的 `<style>` 上添加 `module` 特性：

``` vue
<style module>
.red {
  color: red;
}
.bold {
  font-weight: bold;
}
</style>
```

这个 `module` 特性指引 Vue Loader 作为名为 `$style` 的计算属性，向组件注入 CSS Modules 局部对象。然后你就可以在模板中通过一个动态类绑定来使用它了：

``` vue
<template>
  <p :class="$style.red">
    This should be red
  </p>
</template>
```

因为这是一个计算属性，所以它也支持 `:class` 的对象/数组语法：

``` vue
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

你也可以通过 JavaScript 访问到它：

``` vue
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "red_1VyoJ-uZ"
    // 一个基于文件名和类名生成的标识符
  }
}
</script>
```

你可以查阅 [CSS Modules 规范](https://github.com/css-modules/css-modules)了解更多细节，诸如 [global exceptions](https://github.com/css-modules/css-modules#exceptions) 和 [composition](https://github.com/css-modules/css-modules#composition) 等。

## 可选用法

如果你只想在某些 Vue 组件中使用 CSS Modules，你可以使用 `oneOf` 规则并在 `resourceQuery` 字符串中检查 `module` 字符串：

``` js
// webpack.config.js -> module.rules
{
  test: /\.css$/,
  oneOf: [
    // 这里匹配 `<style module>`
    {
      resourceQuery: /module/,
      use: [
        'vue-style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[local]_[hash:base64:5]'
          }
        }
      ]
    },
    // 这里匹配普通的 `<style>` 或 `<style scoped>`
    {
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }
  ]
}
```

## 和预处理器配合使用

CSS Modules 可以与其它预处理器一起使用：

``` js
// webpack.config.js -> module.rules
{
  test: /\.scss$/,
  use: [
    'vue-style-loader',
    {
      loader: 'css-loader',
      options: { modules: true }
    },
    'sass-loader'
  ]
}
```

## 自定义的注入名称

在 `.vue` 中你可以定义不止一个 `<style>`，为了避免被覆盖，你可以通过设置 `module` 属性来为它们定义注入后计算属性的名称。

``` html
<style module="a">
  /* 注入标识符 a */
</style>

<style module="b">
  /* 注入标识符 b */
</style>
```
