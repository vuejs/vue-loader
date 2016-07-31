# 配置项说明

### loaders

- 类型: `Object`

一个对象。如果 `*.vue` 文件的语言块声明了 `lang` 属性，则该对象指明对应使用哪个 Webpack loader 处理。

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  例如，使用 `babel-loader` 和 `eslint-loader` 处理所有 `<script>` 块：

  ``` js
  // ...
  vue: {
    loaders: {
      js: 'babel!eslint'
    }
  }
  ```

### autoprefixer

- 类型: `Boolean`
- 默认: `true`

  是否对 `*.vue` 文件中的 CSS 进行 autoprefixer

### postcss

- 类型: `Array` or `Function` or `Object`
- ^8.5.0 版本仅支持 `Object`

  自定义指定 PostCSS 插件，应用到 `*.vue` 文件中的 CSS。如果配置一个方法，则该方法会使用同样的 loader 上下文，然后需要返回一个插件数组。

  ``` js
  // ...
  vue: {
    // 注意: 别把 `postcss` 配置项放到 `loaders` 里
    postcss: [require('postcss-cssnext')()],
    autoprefixer: false,
    loaders: {
      // ...
    }
  }
  ```

  这个配置项支持对象类型，包含了传递给 PostCSS 处理器的选项。当你的项目使用 PostCSS，而且依赖自定义的 解析器/生成器 时，用对象类型就很合适：

  ``` js
  postcss: {
    plugins: [...], // 插件列表
    options: {
      parser: sugarss // 使用 sugarss 解析器
    }
  }
  ```

### cssSourceMap

- 类型: `Boolean`
- 默认: `true`

  表明是否支持 CSS source map。如果禁用该功能，可以避免 `css-loader` 的一些相对路径引起的 bug，同时加快构建过程。

  注意，如果 Webpack 配置的 `devtool` 选项没有设置，那么该选项会自动设为 `false`。

### template

- ^8.4.0
- 类型: `Object`

  如果你使用非 HTML 的模板引擎，这个配置可以用来给模板渲染引擎传递配置项 （借助 [consolidate](https://github.com/tj/consolidate.js)）。
