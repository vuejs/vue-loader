# Продвинутая конфигурация vue-loader

Иногда может потребоваться применить пользовательский загрузчик (loader) к секции файла, вместо того чтобы обработкой занимался `vue-loader`. Или вы можете просто хотеть переопределить встроенные настройки загрузчиков для языков по умолчанию. Чтобы сделать это нужно добавить блок `vue` в файл конфигурации Webpack, и указать опцию `loaders`.

### Webpack 1.x

``` js
// webpack.config.js
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
  // настройки vue-loader
  vue: {
    // ... другие настройки vue
    loaders: {
      // обрабатывать все <script> без атрибута "lang" с помощью coffee-loader
      js: 'coffee',
      // обрабатывать <template> непосредственно как HTML-строку,
      // без обработки содержимого с помощью vue-html-loader сначала
      html: 'raw'
    }
  }
}
```

### Webpack 2.x (^2.1.0-beta.25)

``` js
module.exports = {
  // другие настройки...
  module: {
    // module.rules тоже самое, что и module.loaders в 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // обрабатывать все теги <script> без атрибута "lang" с помощью coffee-loader
            js: 'coffee',
            // обрабатывать <template> непосредственно строкой HTML, без обработки его
            // с помощью vue-html-loader сначала
            html: 'raw'
          }
        }
      }
    ]
  }
}
```

Примером использования продвинутой конфигурации может быть например [извлечение CSS из компонентов в отдельный файл](./extract-css.md).
