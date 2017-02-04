# Vue 组件说明

`*.vue` 是自定义文件格式，使用类似 HTML 语法来描述一个 Vue 组件。每个 `*.vue` 文件由三个顶层的语言块组成，分别是 `<template>`、`<script>` 和 `<style>`：

``` html
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
```

`vue-loader` 会解析这个文件，分别取出每个语言块，如果需要，则连接到其他 loader，最后把每一块结果放回去，拼装成一个 CommonJS 模块，它的 `module.exports` 就是 Vue.js 组件的选项对象（options）。

`vue-loader` 支持使用非默认的语言，例如 CSS 预处理器 和 生成 HTML 的模板语言，只需给语言块指定 `lang` 属性。举个例子，你可以像下面这样给组件的 style 块使用 SASS：

``` html
<style lang="sass">
  /* write SASS! */
</style>
```

想获得更多详细介绍，查看 [使用预处理器](../configurations/pre-processors.md)。

### 语言块

#### `<template>`

- 默认语言: `html`。

- 每个 `*.vue` 文件最多放一个 `<template>` 块。

- 这部分内容会抽取解析成字符串，作为编译后的 Vue 组件的 `template` 选项。

#### `<script>`

- 默认语言: `js` (借助 Babel，默认支持 ES2015).

- 每个 `*.vue` 最多放一个 `<script>`。

- 里面的代码会在 CommonJS 风格的环境中执行（就像由 Webpack 打包的普通 `.js` 模块一样），这意味着你可以 `require()` 其他依赖的模块。同时因为默认支持 ES2015，所以你可以使用 ES2015 的 `import` 和 `export` 语法。

- 必须 export 一个 Vue.js 组件的选项对象（options），或是 `Vue.extend()` 返回的构造器，不过建议返回选项对象这样的纯对象。

#### `<style>`

- 默认语言: `css`.

- `*.vue` 文件支持多个 `<style>` 标签

- 默认情况下，取出内容，使用 `style-loader` 处理，最终动态地插入到 document 的 `<head>` 中，变成一个真正 `<style>` 标签。

### Src 引用

如果你更喜欢把 `*.vue` 的各部分放在不同的文件，你可以使用 `src` 属性在语言块中引入外部文件。

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

要注意的是，使用 `src` 引入资源时，要遵循 CommonJS `require()` 的路径规则，这意味着，如果要用相对路径的话，需要带上 `./`，同时，你可以直接引入安装好的 NPM 包的资源，例如：

``` html
<!-- 从安装好的 "todomvc-app-css" npm 包引入一个文件 -->
<style src="todomvc-app-css/index.css">
```

### 语法高亮

目前支持语法高亮的工具有：[Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), 和 [JetBrains products](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm 等等)。 非常欢迎和感谢大家贡献其他编辑器或 IDE 的支持！如果你没用到预处理器，可以在编辑器中把 `*.vue` 文件当作 HTML 文件凑合着用。

### 注释

各个语言块中的注释需要使用对应语言（HTML、CSS、JavaScript、Jade 等等）的注释语法。对于顶级块的注释，则使用 HTML 的注释语法：`<!-- comment contents here -->`

