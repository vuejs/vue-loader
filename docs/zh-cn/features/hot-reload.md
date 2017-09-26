# 热重载

"热重载"不是当你修改文件的时候简单重新加载页面。启用热重载后，当你修改 `.vue` 文件时，所有该组件的实例会被替换，**并且不需要刷新页面**。它甚至保持应用程序和被替换组件的当前状态！当你调整模版或者修改样式时，这极大的提高了开发体验。

![hot-reload](http://blog.evanyou.me/images/vue-hot.gif)

## State Preservation Rules
<!-- @todo: translation -->
- When editing the `<template>` of a component, instances of the edited component will re-render in place, preserving all current private state. This is possible because templates are compiled into new render functions that produce no side-effects.

- When editing the `<script>` part of a component, instances of the edited component will be destroyed and re-created in place. (State of the other components in the app are preserved) This is because `<script>` can include lifecycle hooks that may produce side-effects, so a "reload" instead of re-render is required to ensure consistent behavior. This also means you need to be careful about global side effects such as timers inside your components lifecycle hooks. Sometimes you may need to do a full-page reload if your component produces global side-effects.

- `<style>` hot reload operates on its own via `vue-style-loader`, so it doesn't affect application state.

## Usage

当使用脚手架工具 `vue-cli` 时，热重载是开箱即用的。

When manually setting up your project, hot-reload is enabled automatically when you serve your project with `webpack-dev-server --hot`.

Advanced users may want to check out [vue-hot-reload-api](https://github.com/vuejs/vue-hot-reload-api), which is used internally by `vue-loader`.
