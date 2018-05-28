# Извлечение CSS в отдельный файл

::: tip СОВЕТ
Применяйте извлечение CSS в отдельный файл только в production, чтобы использовать горячую перезагрузку CSS на этапе разработки.
:::

## webpack 4

``` bash
npm install -D mini-css-extract-plugin
```

``` js
// webpack.config.js
var MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  // другие настройки...
  module: {
    rules: [
      // ... другие правила опущены
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
    // ... плагин Vue Loader опущен
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ]
}
```

Также смотрите [документацию mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin).

## webpack 3

``` bash
npm install -D extract-text-webpack-plugin
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // другие настройки...
  module: {
    rules: [
      // ... другие правила опущены
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
    // ... плагин Vue Loader опущен
    new ExtractTextPlugin("style.css")
  ]
}
```

Также смотрите [документацию extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin).
