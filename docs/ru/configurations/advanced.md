# Продвинутая конфигурация vue-loader

Sometimes you may want to apply a custom loader string to a language instead of letting `vue-loader` infer it. Or you may simply want to overwrite the built-in loader configuration for the default languages. To do that, add a `vue` block in your Webpack config file, and specify the `loaders` option.

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
      // обработать все <script> без атрибута "lang" с помощью coffee-loader
      js: 'coffee',
      // обработать <template> непосредственно как HTML-строку, без обработки
      // содержимого с помощью vue-html-loader сначала
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
        // настройки vue-loader
        options: {
          loaders: {
            // ...
          }
        }
      }
    ]
  }
}
```

Примером использования продвинутой конфигурации может быть например [извлечение CSS из компонентов в отдельный файл](./extract-css.md).
