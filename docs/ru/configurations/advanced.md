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
      js: 'coffee-loader',
      // позволяет вам писать markdown внутри <template> тегов...
      // (это доступно только в версиях 10.2.0+)
      html: 'marked'
    }
  }
}
```

### Webpack 2.x

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
            js: 'coffee-loader',
            // позволяет вам писать markdown внутри <template> тегов...
            // (это доступно только в версиях 10.2.0+)
            html: 'marked'
          }
        }
      }
    ]
  }
}
```

Примером использования продвинутой конфигурации может быть например [извлечение CSS из компонентов в отдельный файл](./extract-css.md).
