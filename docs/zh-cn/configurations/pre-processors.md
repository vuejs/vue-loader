# 使用预处理器

在 Webpack 中，所有的预处理器需要通过相应的 loader 来应用。`vue-loader` 允许你使用其他 Webpack loader 来处理 Vue 组件的各部分，它会自动从语言块的 `lang` 属性中探测出合适的 loader。

### CSS

例如，我们想用 SASS 来编译 `<style>` 标签：

``` bash
npm install sass-loader node-sass --save-dev
```

``` html
<style lang="sass">
  /* write sass here */
</style>
```

通过这样声明，`<style>` 标签下的内容会首先通过 `sass-loader` 编译，然后再将结果传给后面的处理器。

### JavaScript

Vue 组件里的所有 JavaScript 默认使用 `babel-loader` 处理，当然你是可以换成别的：

``` bash
npm install coffee-loader --save-dev
```

``` html
<script lang="coffee">
  # Write coffeescript!
</script>
```

### Templates

处理模板的方式有一点点不一样，因为大多数 Webpack 模板 loader，如 `jade-loader` 会返回一个方法，而不是一个编译后的 HTML 字符串。于是我们安装原始的 `jade` 来代替 `jade-loader` ：

``` bash
npm install jade --save-dev
```

``` html
<template lang="jade">
div
  h1 Hello world!
</template>
```

> **关键:** 如果你的 `vue-loader` 版本 `<8.2.0`，你还得安装 `template-html-loader` 才行。

### 内联 Loader 请求

你可以使用在 `lang` 属性使用 [Webpack loader requests](https://webpack.github.io/docs/loaders.html#introduction)。

``` html
<style lang="sass?outputStyle=expanded">
  /* use sass here with expanded output */
</style>
```

不过要注意，这样用的话，Vue 组件就只能在 Webpack 下用，而不能兼容 Browserify 和 [vueify](https://github.com/vuejs/vueify)。**如果你的 Vue 组件要作为第三方组件被复用的话，避免使用这种语法。**
