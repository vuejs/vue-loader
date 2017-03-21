# 生产环境构建

生产环境打包要做两件事：

1. 缩小软件代码；
2. 使用 [setup described in the Vue.js guide](https://vuejs.org/guide/deployment.html) 去除 Vue.js 中的警告。

下面是例子：

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

显然我们不会想在开发时使用这些配置，有几种方式来实现：

1. 使用环境变量动态的构建；

2. 或者，使用两个分开的 Webpack 配置文件，一个用于开发环境，一个用于生产环境。把可能共用的配置放到第三个文件中，如 [vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0) 所示。

只要达到目的，怎么做取决于你。
