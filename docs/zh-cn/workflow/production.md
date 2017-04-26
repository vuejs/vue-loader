# 生产环境构建

生产环境打包要做两件事：

1. 压缩应用代码；
2. 使用 [Vue.js 指南 - 删除警告](https://cn.vuejs.org/v2/guide/deployment.html#删除警告) 去除 Vue.js 中的警告。

下面是配置示例：

``` js
// webpack.config.js
module.exports = {
  // ... other options
  plugins: [
    // short-circuits all Vue.js warning code
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // minify with dead-code elimination
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // optimize module ids by occurrence count
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
}
```

显然，我们不想在开发过程中使用这些配置，所以有几种方法可以解决这个问题：

1. 使用环境变量动态构建；

2. 或者，使用两个分开的 Webpack 配置文件，一个用于开发环境，一个用于生产环境。把可能共用的配置放到第三个文件中，如 [vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0) 所示。

只要达到目标，怎么做取决于你。
