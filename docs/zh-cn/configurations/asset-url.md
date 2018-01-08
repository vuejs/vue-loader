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

### 编译规则

- 如果路径是绝对路径，会原样保留。

- 如果路径以 `.` 开头，将会被看作相对的模块依赖，并按照你的本地文件系统上的目录结构进行解析。

- 如果路径以 `~` 开头，其后的部分将会被看作模块依赖。这意味着你可以用该特性来引用一个 node 依赖中的资源：

  ``` html
  <img src="~/some-npm-package/foo.png">
  ```

- (13.7.0+) 如果路径以 `@` 开头，也会被看作模块依赖。如果你的 webpack 配置中给 `@` 配置了 alias，这就很有用了。所有 `vue-cli` 创建的项目都默认配置了将 `@` 指向 `/src`。

### 相关 Loader 配置

因为 `.png` 不是一个 JavaScript 文件，你需要配置 webpack 使用 [file-loader](https://github.com/webpack/file-loader) 或者 [url-loader](https://github.com/webpack/url-loader) 去处理它们。`vue-cli` 脚手器工具已经为你配置好了。

### 为什么要编译路径

这样做的好处：

1. `file-loader` 可以指定要复制和放置资源文件的位置，以及如何使用版本哈希命名以获得更好的缓存。此外，这意味着 **你可以就近管理图片文件，可以使用相对路径而不用担心布署时URL问题**。使用正确的配置，webpack 将会在打包输出中自动重写文件路径为正确的URL。

2. `url-loader` 允许你有条件将文件转换为内联的 base-64 URL (当文件小于给定的阈值)，这会减少小文件的 HTTP 请求。如果文件大于该阈值，会自动的交给 `file-loader` 处理。
