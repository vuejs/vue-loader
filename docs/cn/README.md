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

[Webpack](http://webpack.github.io/) is a module bundler. It takes a bunch of files, treating each as a module, figuring out the dependencies between them, and bundle them into static assets that are ready for deployment.
[Webpack](http://webpack.github.io/) is a module bundler. It takes a bunch of files, treating each as a module, figuring out the dependencies between them, and bundle them into static assets that are ready for deployment.

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

For a basic example, imagine we have a bunch of CommonJS modules. They cannot run directly inside the browser, so we need to "bundle" them into a single file that can be included via a `<script>` tag. Webpack can follow the dependencies of the `require()` calls and do that for us.

But Webpack can do more than that. With "loaders", we can teach Webpack to transform all types of files in any way we want before outputting the final bundle. Some examples include:

- Transpile ES2015, CoffeeScript or TypeScript modules into plain ES5 CommonJS modules;
- Optionally you can pipe the source code through a linter before doing the compilation;
- Transpile Jade templates into plain HTML and inline it as a JavaScript string;
- Transpile SASS files into plain CSS, then convert it into a JavaScript snippet that insert the resulting CSS as a `<style>` tag;
- Process an image file referenced in HTML or CSS, moved it to the desired destination based on the path configurations, and naming it using its md5 hash.

Webpack is so powerful that when you understand how it works, it can dramatically improve your front-end workflow. Its primary drawback is its verbose and complex configuration; but with this guide you should be able to find solutions for most common issues when using Webpack with Vue.js and `vue-loader`.
