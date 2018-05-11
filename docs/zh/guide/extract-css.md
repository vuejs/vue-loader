# CSS 提取

:::tip 提示
请只在生产环境下使用 CSS 提取，这将便于你在开发环境下进行热重载。
:::

## webpack 4

``` bash
npm install -D mini-css-extract-plugin
```

``` js
// webpack.config.js
var MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  // 其它选项...
  module: {
    rules: [
      // ... 忽略其它规则
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'vue-style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // ... 忽略 vue-loader 插件
    new MiniCssExtractPlugin({
      filename: style.css
    })
  ]
}
```

你还可以查阅 [mini-css-extract-plugin 文档](https://github.com/webpack-contrib/mini-css-extract-plugin)。

## webpack 3

``` bash
npm install -D extract-text-webpack-plugin
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // 其它选项...
  module: {
    rules: [
      // ...其它规则忽略
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader',
          fallback: 'vue-style-loader'
        })
      }
    ]
  },
  plugins: [
    // ...vue-loader 插件忽略
    new ExtractTextPlugin("style.css")
  ]
}
```

你也可以查阅 [extract-text-webpack-plugin 文档](https://github.com/webpack-contrib/extract-text-webpack-plugin)。
