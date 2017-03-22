# PostCSS

由`vue-loader` 处理的 CSS 输出，都是通过 [PostCSS](https://github.com/postcss/postcss) 进行作用域重写，你还可以为 PostCSS 添加自定义插件，例如 [autoprefixer](https://github.com/postcss/autoprefixer) 或者 [CSSNext](http://cssnext.io/)。

## 使用配置文件

`vue-loader` 从 11.0 版本开始支持通过 [`postcss-loader`](https://github.com/postcss/postcss-loader#usage) 自动加载同一个配置文件：

- `postcss.config.js`
- `.postcssrc`
- `package.json` 中的 `postcss`

使用配置文件允许一份配置用于处理普通 CSS 文件(通过`postcss-loader`)，和 `.vue` 文件内的 CSS，这是推荐做法。

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

- 一个返回插件数组的函数；

- 一个对象包含配置选项，传递给 PostCSS 处理器。这在使用自定义解析器/stringifiers 时非常有用:

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: sugarss // use sugarss parser
    }
  }
  ```
