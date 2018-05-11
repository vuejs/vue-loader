# 热重载

“热重载”不只是当你修改文件的时候简单重新加载页面。启用热重载后，当你修改 `.vue` 文件时，该组件的所有实例将在**不刷新页面**的情况下被替换。它甚至保持了应用程序和被替换组件的当前状态！当你调整模版或者修改样式时，这极大地提高了开发体验。

![hot-reload](http://blog.evanyou.me/images/vue-hot.gif)

## 状态保留规则

- 当编辑一个组件的 `<template>` 时，这个组件实例将就地重新渲染，并保留当前所有的私有状态。能够做到这一点是因为模板被编译成了新的无副作用的渲染函数。

- 当编辑一个组件的 `<script>` 时，这个组件实例将就地销毁并重新创建。(应用中其它组件的状态将会被保留) 是因为 `<script>` 可能包含带有副作用的生命周期钩子，所以将重新渲染替换为重新加载是必须的，这样做可以确保组件行为的一致性。这也意味着，如果你的组件带有全局副作用，则整个页面将会被重新加载。

- `<style>` 会通过 `vue-style-loader` 自行热重载，所以它不会影响应用的状态。

## 用法

当使用脚手架工具 `vue-cli` 时，热重载是开箱即用的。

当手动设置你的工程时，热重载会在你启动 `webpack-dev-server --hot` 服务时自动开启。

高阶用户可能希望移步 `vue-loader` 内部使用的 [vue-hot-reload-api](https://github.com/vuejs/vue-hot-reload-api) 继续查阅。

## 关闭热重载

热重载默认是开启的，除非遇到以下情况：

 * webpack 的 `target` 的值是 `node` (服务端渲染)
 * webpack 会压缩代码
 * `process.env.NODE_ENV === 'production'`

你可以设置 `hotReload: false` 选项来显式地关闭热重载：

``` js
module: {
  rules: [
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        hotReload: false // 关闭热重载
      }
    }
  ]
}
```
