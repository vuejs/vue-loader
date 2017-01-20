# PostCSS

Любой CSS проходящий через `vue-loader` обрабатывается [PostCSS](https://github.com/postcss/postcss) для реализации функциональности scoped CSS. Вы также можете добавить другие плагины PostCSS к процессу обработки. Например, [autoprefixer](https://github.com/postcss/autoprefixer) или [CSSNext](http://cssnext.io/).

Пример использования с Webpack 1.x:

``` js
// webpack.config.js
module.exports = {
  // другие настройки...
  vue: {
    // использование плагинов postcss
    postcss: [require('postcss-cssnext')()]
  }
}
```

Для Webpack 2.x:

``` js
// webpack.config.js
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
          // ...
          postcss: [require('postcss-cssnext')()]
        }
      }
    ]
  }
}
```

В дополнение к возможности использовать массив плагинов, опция `postcss` также принимает:

- Функцию, возвращающую массив плагинов;

- Объект, который содержит настройки для передачи в PostCSS. Это пригодится если вы используете проекты с PostCSS которые опираются на пользовательские парсеры/сериализаторы:

  ``` js
  postcss: {
    plugins: [...], // список плагинов
    options: {
      parser: sugarss // использование парсера sugarss
    }
  }
  ```
