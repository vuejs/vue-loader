# Извлечение CSS в отдельный файл

``` bash
npm install extract-text-webpack-plugin --save-dev
```

## Простой путь

> требуется vue-loader@^12.0.0 и webpack@^2.0.0

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
          extractCSS: true
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

Указанный выше пример будет автоматически обрабатывать извлечение `<style>` изнутри `*.vue` файлов и работать с большинством пре-процессоров из коробки.

Обратите внимание, что это будет извлекать только из `*.vue` файлов, для CSS импортрируемого в JavaScript по-прежнему будет требоваться отдельная настройка.

## Конфигурация вручную

Пример конфигурации для извлечения CSS из всех компонентов Vue в отдельный CSS-файл:

### webpack 2.x

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

### webpack 1.x

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
