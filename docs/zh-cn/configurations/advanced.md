# 高级 Loader 配置

有时候，你想要给某种语言指定一个 loader 字符串，而不是让 `vue-loader` 去探测得到，或者只是想覆盖默认语言内置的 loader 配置。想要实现这些，只要在 Webpack 配置中增加一块 `vue` 配置，然后设置 `loaders` 选项。

例子：

``` js
// webpack.config.js
module.exports = {
  // other options...
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  // vue-loader configurations
  vue: {
    // ... other vue options
    loaders: {
      // 使用 coffee-loader 处理所有 <script>，无须指定 "lang" 属性
      js: 'coffee',
      // 直接加载 <template> 作为 HTML字符串
      // 无须先连接（pipe）到 vue-html-loader
      html: 'raw'
    }
  }
}
```

一个更实用的高级 loader 配置就是 [把组件内的 CSS 抽取成单独的文件](./extract-css.md)。