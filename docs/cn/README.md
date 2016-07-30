# 介绍

### `vue-loader` 是什么？

`vue-loader` 是 webpack 的一个 loader，能把像下图格式那样的 Vue 组件转化成纯 JavaScript 模块：

![screenshot](http://blog.evanyou.me/images/vue-component.png)

`vue-loader` 提供了很多不错的功能:

- 默认支持 ES2015；
- 支持对 Vue 组件的各部分使用其他 Webpack loader，例如 针对 `<style>` 使用Sass，针对 `<template>` 使用 Jade；
- 把 `<style>` 和 `<template>` 中引用的静态资源当做一个模块依赖，并使用 Webpack loader 处理；
- 可以给每个组件“模拟”出 CSS 作用域；
- 在开发阶段，支持组件热加载。

简而言之，Webpack 结合 `vue-loader` 提供一个现代的、灵活的和极其给力的前端工作流，帮助你开发 Vue.js 应用。

### Webpack 是什么？

如果你很熟悉 Webpack 大可跳过下面的解释，对于 Webpack 新手，以下是简要说明：

[Webpack](http://webpack.github.io/) 是一个模块化管理打包工具，它找到一堆文件，然后把每个文件当做一个模块，找出它们之间的依赖，打包生成用于开发的静态资源。

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

举个简单例子，想象一下我们有很多 CommonJS 风格的模块，这些模块是没法在浏览器里直接跑的，所以我们要把它们“打包”到一个文件里，于是，就可以通过 `<script>` 标签来引用这个文件。Webpack 能够借着 `require()` 的调用找到所有的依赖，然后打包出一个我们要的 JavaScript 文件。

Webpack 还能做很多别的。借助 "loader"，我们可以告诉 Webpack 如何处理各种类型的文件，让它按照我们期望的转换方式输出到最终的打包文件里。举些例子：

- 转换 ES2015、CoffeeScript 或 TypeScript 代码为原生 ES5 CommonJS 模块；
- 可选择在编译处理前，把源代码连接（pipe）到一个代码检测器；
- 转换 Jade 模板为原生 HTML 然后把它当作 JavaScript 字符串在代码中使用；
- 转换 SASS 文件为原生 CSS, 然后生成一段 JavaScript 代码，这段代码会把转换得到的 CSS 用 `<style>` 标签插入到页面；
- 处理 HTML 或 CSS 引用的图片，根据路径配置把它移动到想要的位置，并使用 md5 命名；

如果你理解 Webpack 是如何工作的，你会感叹它如此给力，它极大地促进前端工作流。它主要缺点就是配置繁琐复杂，不过有了这份文档之后，当你结合 webpack 使用 Vue.js 和 `vue-loader` 时，它能帮你解决大多数常见问题。
