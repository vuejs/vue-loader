# 处理资源 URL 

默认情况下，`vue-loader` 使用 [css-loader](https://github.com/webpack/css-loader) 和 Vue 模版编译器自动处理你的 style 和模版文件。在处理过程中，所有的资源 URL 例如 `<img src="...">`, `background: url(...)` 和 `@import` **会作为模块依赖**。

例如，`url(./image.png)` 会被转换为 `require('./image.png')`,

``` html
<img src="../image.png">
```

将会编译为：

``` js
createElement('img', { attrs: { src: require('../image.png') }})
```

因为 `.png` 不是一个 JavaScript 文件，你需要配置 Webpack 使用 [file-loader](https://github.com/webpack/file-loader) 或者 [url-loader](https://github.com/webpack/url-loader) 去处理它们。脚手器工具 `vue-cli` 已经为你配置好了。

使用它们的好处：

1. `file-loader` 允许你指定资源文件的位置，允许使用 hashes 命名以获得长时间的缓存。此外，这意味着 **你可以就近管理你的图片文件，可以使用相对路径而不用担心布署**。使用正确的配置，Webpack 将会在输出中自动重写为正常的文件路径。

2. `url-loader` 允许你设置转换 base-64 的文件最小值，这会减少小文件的 HTTP 请求。如果文件大于设置值，会自动的交给 `file-loader` 处理。
