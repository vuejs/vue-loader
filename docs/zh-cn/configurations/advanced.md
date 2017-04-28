# Loader 进阶配置

你有时可能想实现：

1. 对语言应用自定义 loader string，而不是让 `vue-loader` 去推断；

2. 覆盖默认语言的内置 loader 配置。

3. 使用自定义 loader 预处理或后处理特定语言块。

为此，请指定 `vue-loader` 的 `loaders` 选项：

> 注意 `preLoaders` 和 `postLoaders` 只在版本 >=10.3.0 支持

### Webpack 2.x

``` js
module.exports = {
  // other options...
  module: {
    // module.rules 与 1.x中的 module.loaders 相同
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `loaders` 覆盖默认 loaders.
          // 以下配置会导致所有的 <script> 标签 "lang" 属性失效。
          // attribute to be loaded with coffee-loader
          loaders: {
            js: 'coffee-loader'
          },

          // `preLoaders` 会在默认 loaders 之前加载.
          // 你可以用来预处理语言块 - 一个例子是用来处理构建时的 i18n
          preLoaders: {
            js: '/path/to/custom/loader'
          },

          // `postLoaders` 会在默认 loaders 之后加载.
          //
          // - 对于 `html`, 默认 loader 返回会编译为 JavaScript 渲染函数
          //
          // - 对于 `css`, 由`vue-style-loader` 返回的结果通常不太有用。使用 postcss 插件将会是更好的选择。
          postLoaders: {
            html: 'babel-loader'
          }

          // `excludedPreLoaders` 应是正则表达式
          excludedPreLoaders: /(eslint-loader)/
        }
      }
    ]
  }
}
```

### Webpack 1.x

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
    loaders: {
      // same configuration rules as above
    }
  }
}
```

进阶配置更实际的用法是 [提取组件中的 CSS 到单个文件](./extract-css.md)。
