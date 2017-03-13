# 介绍

### `vue-loader` 是什么？

`vue-loader` is a loader for Webpack that can transform Vue components written in the following format into a plain JavaScript module:
`vue-loader` 是一个 Webpack 的 loader，可以将用下面这个格式编写的 Vue 组件转换为 JavaScript 模块：

![screenshot](http://blog.evanyou.me/images/vue-component.png)

这里有一些 `vue-loader` 提供的很酷的特性：

- ES2015 默认支持;
- 允许使用其它 Webpack loaders，比如对 `<style>` 使用 SASS 和 对 `<template>` 使用 Jade；
- .vue 文件中允许有自定义节点，使用自定义的 loader 处理他们；
- 把 `<style>` 和 `<template>` 中的静态资源当作模块来对待，并使用 Webpack loaders 进行处理；
- 使用模拟的方式对组合中的 CSS 建立作用域；
- 支持开发期组件的热加载。

简而言之，写 Vue.js 时，组合使用 Webpack 和 `vue-loader` 能带来一个现代，灵活并且非常强大的前端工作流程。

### Webpack 是什么?

如果你已经熟悉了 Webpack，随时可以跳过下面的说明。如果你没有使用过 Webpack,下面是一个快速介绍：

[Webpack](http://webpack.github.io/) 是一个模块打包工具。它将一堆文件，每个作为一个模块，找出他们的依赖关系，将它们打包为可部署的静态资源。

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

一个基本的例子，想像我们有一些 CommonJS 模块，它不能直接在浏览器中运行，所以我们需要打包成一个文件，以便可以使用 `<script>` 引用。Webpack 可以遵循 `require()` 调用的依赖关系，为我们完成这些工作。

但是 Webpack 可以做的不止这些。使用 "loaders"，我们可以教 Webpack 以任何方式去转换所有类型的文件。

- 转换 ES2015,CoffeeScript 或者 TypeScript 模块为 ES5 CommonJS 模块；
- Optionally you can pipe the source code through a linter before doing the compilation;
- 将 Jade 模版转换为纯 HTML 并且嵌入 Javascript 字符串中；
// TODO FIXME
- 将 SASS 文件转换为纯 CSS,然后转入 JavaScript 片段，将生成的 CSS 放入 `<style>` 标签；
- 处理 HTML 或者 CSS 中引用的图片，移动到配置的路径中，并且作用 hash 重命名。

当你理解 Webpack 原理后会感觉它是如此强大，它可以大大优化你的前端工作流程。它主要的缺点是配置复杂麻烦，但是当配合 Vue.js 和 `vue-loader`使用时，本指南应该可以帮助你找到解决方案。
