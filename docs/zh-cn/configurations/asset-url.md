# 资源路径处理

默认情况下，`vue-loader` 使用 [css-loader](https://github.com/webpack/css-loader) 和 Vue 模版编译器自动处理样式和模版文件。在编译过程中，所有的资源路径例如 `<img src="...">`、`background: url(...)` 和 `@import` **会作为模块依赖**。

例如，`url(./image.png)` 会被转换为 `require('./image.png')`，而

``` html
<img src="../image.png">
```

将会编译为：

``` js
createElement('img', { attrs: { src: require('../image.png') }})
```

因为 `.png` 不是一个 JavaScript 文件，你需要配置 webpack 使用 [file-loader](https://github.com/webpack/file-loader) 或者 [url-loader](https://github.com/webpack/url-loader) 去处理它们。`vue-cli` 脚手器工具已经为你配置好了。

使用它们的好处：

1. `file-loader` 可以指定要复制和放置资源文件的位置，以及如何使用版本哈希命名以获得更好的缓存。此外，这意味着 **你可以就近管理图片文件，可以使用相对路径而不用担心布署时URL问题**。使用正确的配置，webpack 将会在打包输出中自动重写文件路径为正确的URL。

2. `url-loader` 允许你有条件将文件转换为内联的 base-64 URL (当文件小于给定的阈值)，这会减少小文件的 HTTP 请求。如果文件大于该阈值，会自动的交给 `file-loader` 处理。
