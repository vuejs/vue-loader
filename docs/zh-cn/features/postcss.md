# PostCSS

由`vue-loader` 处理的 CSS 输出，都是通过 [PostCSS](https://github.com/postcss/postcss) 进行作用域重写，你还可以为 PostCSS 添加自定义插件，例如 [autoprefixer](https://github.com/postcss/autoprefixer) 或者 [CSSNext](http://cssnext.io/)。

## 使用配置文件

`vue-loader` 支持通过 [`postcss-loader`](https://github.com/postcss/postcss-loader#usage) 自动加载同一个配置文件：

- `postcss.config.js`
- `.postcssrc`
- `package.json` 中的 `postcss`

使用配置文件允许你在由 `postcss-loader` 处理的普通CSS文件和 `*.vue` 文件中的 CSS 之间共享相同的配置，这是推荐的做法。

## 配合 `postcss-loader` 使用

因为 `vue-loader` 内部通过 PostCSS 处理其样式，你只需要对标准的 CSS 文件应用 `postcss-loader` 即可。即便你的工程中存在 PostCSS 配置文件，也无需在样式块上指定 `lang="postcss"`。

有时用户可能只是出于语法高亮的目的使用 `lang="postcss"`。从 13.6.0 开始，如果没有 loader (通过 `vue-loader` 自身的 `loaders` 选项) 显式配置下列 PostCSS 扩展，则它们只会简单的进行 `vue-loader` 的默认 PostCSS 转换：

- `postcss`
- `pcss`
- `sugarss`
- `sss`

## 内联选项

或者，你可以使用 `vue-loader` 的 `postcss` 选项来为 `.vue` 文件指定配置。

webpack 1.x 例子：

``` js
// webpack.config.js
module.exports = {
  // 其它配置……
  vue: {
    // 使用自定义 PostCSS 插件
    postcss: [require('postcss-cssnext')()]
  }
}
```

webpack 2.x 例子：

``` js
// webpack.config.js
module.exports = {
  // other options...
  module: {
    // `module.rules` 和 1.x 里的 `module.loaders` 相同
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // `vue-loader` 选项放这里
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

- 要传递给 PostCSS 处理器的包含 options 的对象。当你使用的 PostCSS 项目依赖自定义 parser/stringifiers 时，这很有用：

  ``` js
  postcss: {
    plugins: [...], // 插件列表
    options: {
      parser: 'sugarss' // 使用 sugarss 解析器
    }
  }
  ```

### 禁止自动加载配置文件

在 13.6.0+ 版本中，自动加载 PostCSS 配置文件可以通过指定 `postcss.useConfigFile: false` 来禁用：

``` js
postcss: {
  useConfigFile: false,
  plugins: [/* ... */],
  options: {/* ... */}
}
```

这样做会使得 `*.vue` 文件内部的 PostCSS 配置完全由内联配置所控制。
