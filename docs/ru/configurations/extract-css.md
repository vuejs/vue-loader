# Извлечение CSS в отдельный файл

Пример конфигурации для извлечения CSS из всех компонентов Vue в отдельный CSS-файл:

### Webpack 2.x

``` bash
npm install extract-text-webpack-plugin --save-dev
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // другие настройки...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'vue-style-loader' // <- это внутренняя часть vue-loader, поэтому нет необходимости его устанавливать через NPM
            })
          }
        }
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

### Webpack 1.x

``` bash
npm install extract-text-webpack-plugin --save-dev
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // другие настройки...
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  vue: {
    loaders: {
      css: ExtractTextPlugin.extract("css"),
      // вы также можете добавить <style lang="less"> или другие языки
      less: ExtractTextPlugin.extract("css!less")
    }
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```
