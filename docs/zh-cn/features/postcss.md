# PostCSS

由`vue-loader` 处理的 CSS 输出，都是通过 [PostCSS](https://github.com/postcss/postcss) 进行作用域重写，你还可以为 PostCSS 添加自定义插件，例如 [autoprefixer](https://github.com/postcss/autoprefixer) 或者 [CSSNext](http://cssnext.io/)。

## 使用配置文件

`vue-loader` 从 11.0 版本开始支持通过 [`postcss-loader`](https://github.com/postcss/postcss-loader#usage) 自动加载同一个配置文件：

- `postcss.config.js`
- `.postcssrc`
- `package.json` 中的 `postcss`

使用配置文件允许你在由 `postcss-loader` 处理的普通CSS文件和 `*.vue` 文件中的 CSS 之间共享相同的配置，这是推荐的做法。

## 内联选项

或者，你可以使用 `vue-loader` 的 `postcss` 选项来为 `.vue` 文件指定配置。

Webpack 1.x 例子：

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // use custom postcss plugins
    postcss: [require('postcss-cssnext')()]
  }
}
```

Webpack 2.x 例子:

``` js
// webpack.config.js
module.exports = {
  // other options...
  module: {
    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // vue-loader options goes here
        options: {
          // ...
          postcss: [require('postcss-cssnext')()]
        }
      }
    ]
  }
}
```

除了插件数组之外，`postcss` 配置选项也接受：

- 返回插件数组的函数；

- 要传递给 PostCSS 处理器的包含 options 的对象。当你使用的 PostCSS 项目依赖自定义 `parser/stringifiers`时，这很有用：

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: sugarss // use sugarss parser
    }
  }
  ```
