# 使用预处理器

在 Webpack 中，所有的预处理器需要匹配对应的 loader。 `vue-loader` 允许你使用其它 Webpack loaders 处理 Vue 组件的某一部分。它会根据 `lang` 属性自动推断出要使用的 loaders。

### CSS

例如，使用 SASS 编译我们的 `<style>` 语言块：

``` bash
npm install sass-loader node-sass --save-dev
```

``` html
<style lang="sass">
  /* write sass here */
</style>
```

在内部，`<style>` 标签中的内容将会先由 `sass-loader` 进行处理，然后再传递进行下一步处理。

#### sass-loader 警告

与名称相反，[*sass*-loader](https://github.com/jtangelder/sass-loader) 默认解析 *SCSS* 语法。如果你想要使用 *SASS* 语法，你需要配置 `vue-loader` 的选项：

```javascript
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
      sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
    }
  }
}
```

如要获得更多关于 `vue-loader` 的配置信息，请查看 [Loader 进阶配置](./advanced.md) 章节。

### JavaScript

Vue 组件中的所有 JavaScript 默认使用 `babel-loader` 处理。你也可以改变处理方式：

``` bash
npm install coffee-loader --save-dev
```

``` html
<script lang="coffee">
  # Write coffeescript!
</script>
```

### 模版

模版的处理方式略有不同，因为大多数 Webpack 模版处理器（比如 `pug-loader`）会返回模版处理函数，而不是编译的 HTML 字符串，我们使用原始的 `pug` 替代 `pug-loader`:

``` bash
npm install pug --save-dev
```

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

> **重要:** 如果你使用 `vue-loader@<8.2.0`， 你还需要安装 `template-html-loader`。

### 行内 Loader Requests

你可以在 `lang` 属性中使用 [Webpack loader requests](https://webpack.github.io/docs/loaders.html#introduction) ：

``` html
<style lang="sass?outputStyle=expanded">
  /* use sass here with expanded output */
</style>
```

但是，这使你的 Vue 组件只适用于 Webpack，不能与 Browserify and [vueify](https://github.com/vuejs/vueify) 一同使用。**如果你打算将你的 Vue 组件作为可重复使用的第三方组件，请避免使用这个语法。**
