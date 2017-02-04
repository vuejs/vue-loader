# 处理资源 URL

默认情况下，`vue-loader` 使用 [css-loader](https://github.com/webpack/css-loader) 和 [vue-html-loader](https://github.com/vuejs/vue-html-loader) （只是 Vue 风格的 [html-loader](https://github.com/webpack/html-loader)） 自动处理你的样式和模板。这意味着，所有的资源 URL，例如 `<img src="...">`、`background: url(...)` 和 CSS `@import` 都会被 **转化处理成模块依赖**。

例如，`url(image.png)` 将会被转化为 `require('./image.png')`，因为 `.png` 不是 JavaScript，所以你需要告诉 Webpack 使用 [file-loader](https://github.com/webpack/file-loader) 和 [url-loader](https://github.com/webpack/url-loader) 来处理他们。这做法看上去有点累赘，不过也给你带来极大的好处，就是可以管理静态资源了：

1. `file-loader` 允许你指定文件从哪里来和到哪里去，以及使用哈希命名来作版本控制。最给力的是，你在源码里面可以基于文件结构使用相对路径，然后 Webpack 会根据你给出的配置，自动把它们重写成你要的路径，然后输出到打包文件里。（译者：碉堡了，为什么那么多人还用~~~）

2. `url-loader` 允许你给定一个阈值，当 url 引用的文件大小小于这个值时，则把文件内容转化为内联的 base64 data URL，这能减少小文件的 HTTP 请求数。如果文件大小超过这个阈值，则自动回退使用 `file-loader` 处理。

这里有一个例子，展示 Webpack 配置文件如何处理 `.png`, `jpg` 和 `.gif` 文件，并且把文件大小小于 10kb 的作为 base64 data URL：

``` bash
npm install url-loader file-loader --save-dev
```

``` js
// webpack.config.js
module.exports = {
  // ... other options
  module: {
    loaders: [
      // ... other loaders
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url',
        query: {
          // 低于该值则内联为 base64，单位是 byte
          limit: 10000,
          // 对于超过阈值的文件，定义命名规则
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  }
}
```
