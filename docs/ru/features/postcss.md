# PostCSS

Любой CSS проходящий через `vue-loader` обрабатывается [PostCSS](https://github.com/postcss/postcss) для реализации функциональности scoped CSS. Вы также можете добавить другие плагины PostCSS к процессу обработки. Например, [autoprefixer](https://github.com/postcss/autoprefixer) или [CSSNext](http://cssnext.io/).

## Использование файла конфигурации

Начиная с версии 11.0 `vue-loader` поддерживает файлы конфигурации PostCSS поддерживаемые с помощью [`postcss-loader`](https://github.com/postcss/postcss-loader#usage):

- `postcss.config.js`
- `.postcssrc`
- `postcss` поле в `package.json`

Рекомендуется использовать файл конфигурации, это позволяет использовать один и тот же конфиг для обработки ваших CSS файлов, обрабатываемых `postcss-loader` и CSS внутри `*.vue` файлов.

## Указание настроек в опциях vue-loader

В качестве альтернативы, вы можете указать конфигурацию PostCSS специально для `*.vue` файлов с помощью опции `postcss` для `vue-loader`.

Пример использования с webpack 1.x:

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

Для webpack 2.x:

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
      parser: 'sugarss' // использование парсера sugarss
    }
  }
  ```
