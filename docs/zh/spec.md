---
title: 单文件组件规范
sidebar: auto
---

# Vue 单文件组件 (SFC) 规范

## 简介

`.vue` 文件是一个自定义的文件类型，用类 HTML 语法描述一个 Vue 组件。每个 `.vue` 文件包含三种类型的顶级语言块 `<template>`、`<script>` 和 `<style>`，还允许添加可选的自定义块：

``` vue
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>

<custom1>
  This could be e.g. documentation for the component.
</custom1>
```

`vue-loader` 会解析文件，提取每个语言块，如有必要会通过其它 loader 处理，最后将他们组装成一个 ES Module，它的默认导出是一个 Vue.js 组件选项的对象。

`vue-loader` 支持使用非默认语言，比如 CSS 预处理器，预编译的 HTML 模版语言，通过设置语言块的 `lang` 属性。例如，你可以像下面这样使用 Sass 语法编写样式：

``` vue
<style lang="sass">
  /* write Sass! */
</style>
```

更多细节可以在[使用预处理器](./guide/pre-processors.md)中找到。

## 语言块

### 模板

- 每个 `.vue` 文件最多包含一个 `<template>` 块。

- 内容将被提取并传递给 `vue-template-compiler` 为字符串，预处理为 JavaScript 渲染函数，并最终注入到从 `<script>` 导出的组件中。

### 脚本

- 每个 `.vue` 文件最多包含一个 `<script>` 块。

- 这个脚本会作为一个 ES Module 来执行。

- 它的**默认导出**应该是一个 Vue.js 的[组件选项对象](https://cn.vuejs.org/v2/api/#选项-数据)。也可以导出由 `Vue.extend()` 创建的扩展对象，但是普通对象是更好的选择。

- 任何匹配 `.js` 文件 (或通过它的 `lang` 特性指定的扩展名) 的 webpack 规则都将会运用到这个 `<script>` 块的内容中。

### 样式

- 默认匹配：`/\.css$/`。

- 一个 `.vue` 文件可以包含多个 `<style>` 标签。

- `<style>` 标签可以有 `scoped` 或者 `module` 属性 (查看 [scoped CSS](./guide/scoped-css.md)和 [CSS Modules](./guide/css-modules.md)) 以帮助你将样式封装到当前组件。具有不同封装模式的多个 `<style>` 标签可以在同一个组件中混合使用。

- 任何匹配 `.css` 文件 (或通过它的 `lang` 特性指定的扩展名) 的 webpack 规则都将会运用到这个 `<style>` 块的内容中。

### 自定义块

可以在 `.vue` 文件中添加额外的自定义块来实现项目的特定需求，例如 `<docs>` 块。`vue-loader` 将会使用标签名来查找对应的 webpack loader 来应用在对应的块上。webpack loader 需要在 `vue-loader` 的选项 `loaders` 中指定。

更多细节，查看[自定义块](./guide/custom-blocks.md)。

### Src 导入

如果喜欢把 `.vue` 文件分隔到多个文件中，你可以通过 `src` 属性导入外部文件：

``` vue
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

需要注意的是 `src` 导入遵循和 webpack 模块请求相同的路径解析规则，这意味着：

- 相对路径需要以 `./` 开始
- 你可以从 NPM 依赖中导入资源：

``` vue
<!-- import a file from the installed "todomvc-app-css" npm package -->
<style src="todomvc-app-css/index.css">
```

在自定义块上同样支持 `src` 导入，例如：

``` vue
<unit-test src="./unit-test.js">
</unit-test>
```

## 语法高亮 / IDE 支持

目前有下列 IDE/编辑器 支持语法高亮：

- [Sublime Text](https://github.com/vuejs/vue-syntax-highlight)
- [VS Code](https://marketplace.visualstudio.com/items?itemName=octref.vetur)
- [Atom](https://atom.io/packages/language-vue)
- [Vim](https://github.com/posva/vim-vue)
- [Emacs](https://github.com/AdamNiederer/vue-mode)
- [Brackets](https://github.com/pandao/brackets-vue)
- [JetBrains IDEs](https://plugins.jetbrains.com/plugin/8057) (WebStorm、PhpStorm 等)

非常感谢其他编辑器/IDE 所做的贡献！如果在 Vue 组件中没有使用任何预处理器，你可以把 `.vue` 文件当作 HTML 对待。

## 注释

在语言块中使用该语言块对应的注释语法 (HTML、CSS、JavaScript、Jade 等)。顶层注释使用 HTML 注释语法：`<!-- comment contents here -->`。
