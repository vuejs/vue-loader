# PostCSS 和 Autoprefixer

所有经过 `vue-loader` 处理输出的 CSS 都会连接（pipe）到 [PostCSS](https://github.com/postcss/postcss) 进行作用域 CSS 重写，然后使用 [autoprefixer](https://github.com/postcss/autoprefixer) 自动添加前缀。

### 配置 Autoprefixer

你可以使用 webpack 配置中 `vue` 下的 `autoprefixer` 配置项来配置 autoprefixer。参考 [autoprefixer 的可配置项](https://github.com/postcss/autoprefixer#options)。当然，你可以设置 `false` 来禁用 autoprefixing。

例子：

``` js
// webpack.config.js
module.exports = {
  // 其他配置项...
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  // vue-loader 配置
  vue: {
    // 配置 autoprefixer
    autoprefixer: {
      browsers: ['last 2 versions']
    }
  }
}
```

### 自定义 PostCSS 插件

要自定义使用 PostCSS 的插件，可以在 `vue` 下的 `postcss` 配置项传入一个数组。下面是使用 [CSSNext](http://cssnext.io/) 插件的例子：

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // 自定义使用 postcss 插件
    postcss: [require('postcss-cssnext')()],
    // 禁用 vue-loader 的 autoprefixing.
    // 因为 cssnext 包含这个功能，所以禁用它准没错
    autoprefixer: false
  }
}
```

`postcss` 配置项除了可以配置数组以外，还支持：

- 一个方法，其中返回插件数组

- 一个对象，包含传递给 PostCSS 处理器的配置项。如果你使用 PostCSS 时依赖了自定义的 解析器/生成器，这种配置就很好用。

  ``` js
  postcss: {
    plugins: [...], // 插件列表
    options: {
      parser: sugarss // 使用 sugarss 解析器
    }
  }
  ```
