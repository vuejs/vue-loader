# Vue 组件细则

`.vue` 文件是一个自定义的文件类型,用类 HTML 语法描述一个 Vue 组件。每个 `.vue` 文件包含三种类型的顶级语言块 `<template>`, `<script>` 和 `<style>`，还允许添加可选的自定义块：

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

<custom1>
  This could be e.g. documentation for the component.
</custom1>
```

`vue-loader` 会解析文件，提取每个语言块，如有必要会通过其它 loaders 处理，最后将他们组装成一个 CommonJS 模块，`module.exports` 出一个 Vue.js 组件对象。

`vue-loader` 支持使用非默认放言，比如 CSS 预处理器，预编译的 HTML 模版语言，通过设置语言块的 `lang` 属性。例如，你可以像下面这样使用 SASS 语法编写 style： 

``` html
<style lang="sass">
  /* write SASS! */
</style>
```

更多细节可以在 [预处理器](../configurations/pre-processors.md) 中找到。

### 语言块

#### `<template>`

- 默认语言：`html`。

- 每个 `.vue` 文件最多包含一个 `<template>` 块

- 内容将被提取为字符串，将编译并用作 Vue 组件的 `template` 选项。

#### `<script>`

- 默认语言：`js` (ES2015 在检测到配置 `babel-loader` 或 `buble-loader` 时自动支持).

- 每个 `.vue` 文件最多包含一个 `<script>` 块

- script 在 CommonJS 环境中执行（就像通过 Webpack 打包的正常 js 模块），这意味这你可以 `require()` 其它依赖。在 ES2015 在支持下,你也可以使用 `import` 和 `export` 语法。

- script 必须导出 Vue.js 组件对象。也可以导出由 `Vue.extend()` 创建的扩展对象，但是普通对象是最好的选择。

#### `<style>`

- 默认语言： `css`。

- 一个 `.vue` 文件可以包含多个 `<style>` 标签。

- `<style>` 标签可以有 `scoped` 或者 `module` 属性 (查看 [CSS 作用域](../features/scoped-css.md) 和 [CSS 模块](../features/css-modules.md)) 以帮助你将样式封装到当前组件。多个不同封装的 `<style>` 标签将会混合在一个组件中。

- 默认情况下内容将会使用 `style-loader` 提取并通过 `<style>` 标签动态加入文档的 `<head>` 中，也可以[配置 Webpack 将所有 styles 提取到单个 CSS 文件中](../configurations/extract-css.md).

### 自定义块

> 只在 vue-loader 10.2.0+ 中支持

可以在 `.vue` 文件中填加额外的自定义块来实现项目的特定需求，例如 `<docs>` 块。`vue-loader` 将会使用标签名来查找对应的 webpack loaders 来应用在对应的块上。webpack loaders 需要在 `vue-loader` 的选项 `loaders` 中指定。

更多细节，查看 [自定义块](../configurations/custom-blocks.md)。

### Src 导入

如果你喜欢分隔你的 `.vue` 文件到多个文件中，你可以通过 `src` 属性导入外部文件：

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

需要注意的是 `src` 导入遵循和 `require()` 一样的规则，这意味着你相对路径需要以 `./` 开始，你还可以从 NPM packages 中直接导入资源，例如：

``` html
<!-- import a file from the installed "todomvc-app-css" npm package -->
<style src="todomvc-app-css/index.css">
```

在自定义块上同样支持 `src` 导入，例如：

``` html
<unit-test src="./unit-test.js">
</unit-test>
```

### 语法高亮


目前语法高亮支持 [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), and [JetBrains products](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm, 等)。 对其他编辑器/IDEs 的贡献将会非常感谢！如果在 Vue 组件中没有使用任何预处理器，你可以把 `.vue` 文件当作HTML对待。

### 注释

在语言块中使用该语言块对应的注释语法（HTML, CSS, JavaScript, Jade, 等）。顶层注释使用 HTML 注释语法：`<!-- comment contents here -->`
