---
sidebar: auto
---

# 选项参考

## transformAssetUrls

- 类型：`{ [tag: string]: string | Array<string> }`
- 默认值：

  ``` js
  {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: ['xlink:href', 'href'],
    use: ['xlink:href', 'href']
  }
  ```

  在模板编译过程中，编译器可以将某些特性转换为 `require` 调用，例如 `src` 中的 URL。因此这些目标资源可以被 webpack 处理。例如 `<img src="./foo.png">` 会找到你文件系统中的 `./foo.png` 并将其作为一个依赖包含在你的包里。

## compiler

- 类型：`VueTemplateCompiler`
- 默认值：`require('vue-template-compiler')`

  覆写用来编译单文件组件中 `<template>` 块的默认编译器。

## compilerOptions

- 类型：`Object`
- 默认值：`{}`

  模板编译器的选项。当使用默认的 `vue-template-compiler` 的时候，你可以使用这个选项来添加自定义编译器指令、模块或通过 `{ preserveWhitespace: false }` 放弃模板标签之间的空格。

  详情查阅 [`vue-template-compiler` 选项参考](https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-template-compiler/README.md#选项).

## transpileOptions

- 类型：`Object`
- 默认值：`{}`

  为渲染函数的生成码配置从 ES2015+ 到 ES5 的转译选项。这里的[转译器](https://github.com/vuejs/vue-template-es2015-compiler)是一份 [Buble](https://github.com/Rich-Harris/buble) 的 fork，因此你可以在[这里](https://buble.surge.sh/guide/#using-the-javascript-api)查阅可用的选项。

  模板渲染函数编译支持一个特殊的变换 `stripWith` (默认启用)，它会删除生成的渲染函数中的 `with` 用法，使它们兼容严格模式。

## optimizeSSR

- 类型：`boolean`
- 默认值：当 webpack 配置中包含 `target: 'node'` 且 `vue-template-compiler` 版本号大于等于 2.4.0 时为 `true`。

  开启 Vue 2.4 服务端渲染的编译优化之后，渲染函数将会把返回的 vdom 树的一部分编译为字符串，以提升服务端渲染的性能。在一些情况下，你可能想要明确地将其关掉，因为该渲染函数只能用于服务端渲染，而不能用于客户端渲染或测试环境。

## hotReload

- 类型：`boolean`
- 默认值：在开发环境下是 `true`，在生产环境下或 webpack 配置中有 `target: 'node'` 的时候是 `false`。
- 允许的值：`false` (`true` 会强制热重载，即便是生产环境或 `target: 'node'` 时)

  是否使用 webpack 的[模块热替换](https://webpack.js.org/concepts/hot-module-replacement/)在浏览器中应用变更而**不重载整个页面**。
  用这个选项 (值设为 `false`) 在开发环境下关闭热重载特性。

## productionMode

- 类型：`boolean`
- 默认值：`process.env.NODE_ENV === 'production'`

强制指定为生产环境，即禁止 loader 注入只在开发环境有效的代码 (例如 hot-reload 相关的代码)。

## shadowMode

- 类型：`boolean`
- 默认值：`false`

编译用于 Shadow DOM 内部的组件。在该模式下，组件的样式会被注入到 `this.$root.$options.shadowRoot`，而不是文档的 head 部分。

## cacheDirectory / cacheIdentifier

- 类型：`string`
- 默认值：`undefined`

当这两个选项同时被设置时，开启基于文件系统的模板编译缓存 (需要在工程里安装 `cache-loader`)。

::: tip 注意
  在内部，`vue-loader` 和 `cache-loader` 之间的交互使用了 [loader 的内联 import 语法](https://webpack.js.org/concepts/loaders/#inline)，`!` 将会被认为是不同 loaders 之间的分隔符，所以请确保你的 `cacheDirectory` 路径中不包含 `!`。
:::

## prettify

- 类型：`boolean`
- 默认值：`true`

在开发环境下，我们默认使用 [prettier](https://prettier.io/) 格式化编译后的模板渲染代码，以方便调试。然而，如果你开发时碰到了 prettier 的某些罕见 bug，比如[格式化多层嵌套的函数时运行时间过长](https://github.com/prettier/prettier/issues/4672)，你可以通过禁用这个选项来绕开。

## exposeFilename

- 类型：`boolean`
- 默认值：`false`

在非生产环境下，`vue-loader` 会为组件注入一个 `__file` 属性以提升调试体验。如果一个组件没有 `name` 属性，Vue 会通过 `__file` 字段进行推断，并用于控制台警告中的展示。

这个属性在生产环境构建时会被去掉。但如果你在开发一个组件库并且烦于为每个组件设置 `name`，你可能还会想使用它。这时可以把这个选项打开。
