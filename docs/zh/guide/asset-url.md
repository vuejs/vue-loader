# 处理资源路径

当 Vue Loader 编译单文件组件中的 `<template>` 块时，它也会将所有遇到的资源 URL 转换为 **webpack 模块请求**。

例如，下面的模板代码片段：

``` vue
<img src="../image.png">
```

将会被编译成为：

``` js
createElement('img', {
  attrs: {
    src: require('../image.png') // 现在这是一个模块的请求了
  }
})
```

默认下列标签/特性的组合会被转换，且这些组合时可以使用 [transformAssetUrls](../options.md#transformasseturls) 选项进行配置的。

``` js
{
  video: ['src', 'poster'],
  source: 'src',
  img: 'src',
  image: 'xlink:href'
}
```

此外，如果你配置了为 `<style>` 块使用 [css-loader](https://github.com/webpack-contrib/css-loader)，则你的 CSS 中的资源 URL 也会被同等处理。

## 转换规则

资源 URL 转换会遵循如下规则：

- 如果路径是绝对路径 (例如 `/images/foo.png`)，会原样保留。

- 如果路径以 `.` 开头，将会被看作相对的模块依赖，并按照你的本地文件系统上的目录结构进行解析。

- 如果路径以 `~` 开头，其后的部分将会被看作模块依赖。这意味着你可以用该特性来引用一个 Node 依赖中的资源：

  ``` html
  <img src="~some-npm-package/foo.png">
  ```

- 如果路径以 `@` 开头，也会被看作模块依赖。如果你的 webpack 配置中给 `@` 配置了 alias，这就很有用了。所有 `vue-cli` 创建的项目都默认配置了将 `@` 指向 `/src`。

## 相关的 Loader

因为像 `.png` 这样的文件不是一个 JavaScript 模块，你需要配置 webpack 使用 [file-loader](https://github.com/webpack/file-loader) 或者 [url-loader](https://github.com/webpack/url-loader) 去合理地处理它们。通过 Vue CLI 创建的项目已经把这些预配置好了。

## 为什么

转换资源 URL 的好处是：

1. `file-loader` 可以指定要复制和放置资源文件的位置，以及如何使用版本哈希命名以获得更好的缓存。此外，这意味着 **你可以就近管理图片文件，可以使用相对路径而不用担心部署时 URL 的问题**。使用正确的配置，webpack 将会在打包输出中自动重写文件路径为正确的 URL。

2. `url-loader` 允许你有条件地将文件转换为内联的 base-64 URL (当文件小于给定的阈值)，这会减少小文件的 HTTP 请求数。如果文件大于该阈值，会自动的交给 `file-loader` 处理。
