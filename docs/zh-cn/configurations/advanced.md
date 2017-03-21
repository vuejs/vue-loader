# 高级配置

有些时候你想要这样：

1. 对语言应用自定义 loader string，而不是让 `vue-loader` 去推断；

2. 覆盖默认语言的内置配置。

3. 默认语言预处理或者后处理配置。

为了实现这些，详细说明 `vue-loader` 的 `loaders` 选项：

> 注意 `preLoaders` 和 `postLoaders` 只在版本 >=10.3.0 支持

### Webpack 2.x

``` js
module.exports = {
  // other options...
  module: {
    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `loaders` will overwrite the default loaders.
          // The following config will cause all <script> tags without "lang"
          // attribute to be loaded with coffee-loader
          loaders: {
            js: 'coffee-loader'
          },

          // `preLoaders` are attached before the default loaders.
          // You can use this to pre-process language blocks - a common use
          // case would be build-time i18n.
          preLoaders: {
            js: '/path/to/custom/loader'
          },

          // `postLoaders` are attached after the default loaders.
          //
          // - For `html`, the result returned by the default loader
          //   will be compiled JavaScript render function code.
          //
          // - For `css`, the result will be returned by vue-style-loader
          //   which isn't particularly useful in most cases. Using a postcss
          //   plugin will be a better option.
          postLoaders: {
            html: 'babel-loader'
          }
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

高级配置的实际用法在 [extracting CSS inside components into a single file](./extract-css.md) 中。
