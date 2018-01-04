# 选项参考

## webpack 1 和 2 之间的使用差异

webpack 2：配置直接放到 loader rule 中。

``` js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `vue-loader` options
        }
      }
    ]
  }
}
```

webpack 1.x：在 webpack 配置中添加根节点 `vue` 块。

``` js
module.exports = {
  // ...
  vue: {
    // `vue-loader` options
  }
}
```

### loaders

- 类型：`{ [lang: string]: string }`

  指定 webpack loader 对象覆盖用于 `*.vue` 文件内的语言块的默认 loader。如果指定，该键对应于语言块的 `lang` 属性。每种类型的默认 `lang` 是：

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  例如，使用 `babel-loader` 和 `eslint-loader` 处理所有的 `<script>` 块：

  ``` js
  // webpack 2.x config
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader!eslint-loader'
          }
        }
      }
    ]
  }
  ```

### preLoaders

- 类型：`{ [lang: string]: string }`
- 仅在 10.3.0+ 版本中支持

  配置格式和 `loaders` 相同，但是 `preLoaders` 会在默认 loaders 之前处理。你可以用来预处理语言块 - 一个常见用例是用来处理构建时的 i18n。

### postLoaders

- 类型：`{ [lang: string]: string }`
- 仅在 10.3.0+ 版本中支持

  配置格式和 `loaders` 相同，但是 `postLoaders` 会在默认 loaders 之后处理。你可以用来后处理语言块。注意这会有些复杂：

  - 对于 `html`，默认 loader 返回结果会被编译为 JavaScript 渲染函数。

  - 对于 `css`，由`vue-style-loader` 返回的结果通常不太有用。使用 PostCSS 插件将会是更好的选择。

### postcss

> 注意：在 11.0.0+ 版本中，推荐使用 PostCSS 配置文件代替。[用法和 `postcss-loader` 相同](https://github.com/postcss/postcss-loader#usage)。

- 类型：`Array` or `Function` or `Object`


  指定要应用于 `.vue` 文件中 CSS 的自定义 PostCSS 插件。如果使用函数，函数将使用相同的 loader 上下文调用，并返回一个插件数组。

  ``` js
  // ...
  {
    loader: 'vue-loader',
    options: {
      // 注意：不要在 `loader` 下嵌入 `postcss` 选项
      postcss: [require('postcss-cssnext')()],
      loaders: {
        // ...
      }
    }
  }
  ```

  这个配置选项也可以是一个对象，这在使用依赖于自定义 parser/stringifiers 的项目会非常有用：

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: sugarss // use sugarss parser
    }
  }
  ```

### postcss.config

> 13.2.1 新增

- 类型：`Object`
- 默认值：`undefined`

  这个字段允许用 [postcss-loader](https://github.com/postcss/postcss-loader#config-1) 同样的方式自定义 PostCSS 插件。

  - **postcss.config.path**

    指定一个加载 PostCSS 配置文件的路径 (文件或目录)。

    ``` js
    postcss: {
      config: {
        path: path.resolve('./src')
      }
    }
    ```

  - **postcss.config.ctx**

    向 PostCSS 插件提供上下文。详见 [postcss-loader 文档](https://github.com/postcss/postcss-loader#context-ctx)。

### postcss.useConfigFile

> 13.6.0 新增

- 类型：`boolean`
- 默认值：`true`

  设为 `false` 之后可以禁止自动加载 PostCSS 配置文件。

### cssSourceMap

- 类型: `Boolean`
- 默认值: `true`

  是否开启 CSS 的 source maps，关闭可以避免 `css-loader` 的 some relative path related bugs 同时可以加快构建速度。

  注意，这个值会在 webpack 配置中没有 `devtool` 的情况下自动设置为 `false`。

### esModule

- 类型: `Boolean`
- 默认值: `undefined`

  是否导出兼容 esModule 的代码，默认情况下 vue-loader 会导出 commonjs 格式，像 `module.exports = ....`。当 `esModule` 设置为 true 的情况下，导出会变为 `exports.__esModule = true; exports = ...`。适用于与 Babel 以外的 transpiler 互操作，比如 TypeScript。

### preserveWhitespace

- 类型: `Boolean`
- 默认值: `true`

  如果设置为 `false`，模版中 HTML 标签之前的空格将会被忽略。

### compilerModules

- 类型：`Array<ModuleOptions>`
- 默认值：`[]`

  为 `vue-template-compiler` 配置 `modules` 选项。相关细节请查阅 `vue-template-compiler` 的 [`modules` 选项](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options)。

### compilerDirectives

- 类型：`{ [tag: string]: Function }`
- 默认值：`{}` (v13.0.5+)

  > 版本说明：在 v12.x 中，从 v12.2.3+ 开始支持

  为 `vue-template-compiler` 配置 `directives` 选项。相关细节请查阅 `vue-template-compiler` 的 [`modules` 选项](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options)。

### transformToRequire

- 类型: `{ [tag: string]: string | Array<string> }`
- 默认值: `{ img: 'src', image: 'xlink:href' }`

  在模版编译过程中，编译器可以将某些属性，如 `src` 路径，转换为 `require` 调用，以便目标资源可以由 webpack 处理。默认配置会转换 `<img>` 标签上的 `src` 属性和 SVG 的 `<image>` 标签上的 `xlink：href` 属性。

### buble

- 类型: `Object`
- 默认值: `{}`

  配置 `buble-loader` 的选项 (如果存在)，并且 buble 编译传递模板渲染函数。

  > 版本警告：在 9.x 版本中，模板表达式通过现在已经删除的 `templateBuble` 选项单独配置。

  模板渲染函数编译支持一个特殊的变换 `stripWith` (默认启用)，它删除生成的渲染函数中的 `with` 用法，使它们兼容严格模式。

  配置例子：

  ``` js
  // webpack 1
  vue: {
    buble: {
      // 启用对象扩展运算符
      // 注意：你需要自己提供 Object.assign polyfill！
      objectAssign: 'Object.assign',

      // turn off the `with` removal
      transforms: {
        stripWith: false
      }
    }
  }

  // webpack 2
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          buble: {
            // same options
          }
        }
      }
    ]
  }
  ```

### extractCSS

> 12.0.0 新增

使用 `extract-text-webpack-plugin` 自动提取 CSS。适用于大多数预处理器，且也可在生产环境进行压缩。

传入的值可以是 `true`，也可以是插件的一个实例 (这样可以为多个提取的文件使用多个提取插件的实例)。

这应当只用于生产环境，以便可以在开发过程中使用热重载。

示例：

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // other options...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: true
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

或者传递插件的一个实例：

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var plugin = new ExtractTextPlugin("style.css")

module.exports = {
  // other options...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: plugin
        }
      }
    ]
  },
  plugins: [
    plugin
  ]
}
```

### optimizeSSR

> 12.1.1 新增

- 类型: `boolean`
- 默认值: 当 webpack 配置中包含 `target: 'node'` 且 `vue-template-compiler` 版本号大于等于 2.4.0 时为 `true`。

开启 Vue 2.4 服务端渲染的编译优化之后，渲染函数将会把返回的 vdom 树的一部分编译为字符串，以提升服务端渲染的性能。在一些情况下，你可能想要明确的将其关掉，因为该渲染函数只能用于服务端渲染，而不能用于客户端渲染或测试环境。

### hotReload

> 13.5.0 新增

- 类型: `boolean`
- 默认值: 在开发环境下是 `true`，在生产环境下或 webpack 配置中有 `target: 'node'` 的时候是 `false`。
- 允许的值: `false` (`true` 会强制热重载，即便是生产环境或 `target: 'node'` 时)

是否使用 webpack 的[模块热替换](https://webpack.js.org/concepts/hot-module-replacement/)在浏览器中应用变更而**不重载整个页面**。
用这个选项 (值设为 `false`) 在开发环境下关闭热重载特性。
