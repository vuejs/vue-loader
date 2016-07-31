# 构建用于生产环境

当构建打包文件用于生产环境时，有两件事情要做：

1. 压缩我们的应用代码；
2. 按照 [Vue.js 教程中描述的步骤](http://vuejs.org/guide/application.html#Deploying_for_Production)，移除 Vue.js 源码中的所有警告代码。

下面是配置例子：

``` js
// webpack.config.js
module.exports = {
  // ... other options
  plugins: [
    // 毙掉所有 Vue.js 的警告代码
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // 通过移除“死代码”实现压缩
    // （译者: 例如 if(true) 就是死代码）
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // 通过比对模块使用频率有话模块 id 
    //（译者：可能是用得最多的模块用最短的 id 命名吧）
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}
```

显然，我们不想在开发阶段使用这个配置，所以提供了几种方式来解决：

1. 根据环境变量动态的设置配置；

2. 或者，使用不同的 Webpack 配置文件，一个用于开发环境，一个用于生产，还可以把两者的共同配置放在第三方文件里，正如 [vue-loader 例子](https://github.com/vuejs/vue-loader-example/tree/master/build) 中展示的那样。

只要达到目的，你爱怎么弄就怎么弄。
