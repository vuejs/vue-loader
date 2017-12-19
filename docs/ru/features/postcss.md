# PostCSS

Любой CSS проходящий через `vue-loader` обрабатывается [PostCSS](https://github.com/postcss/postcss) для реализации функциональности scoped CSS. Вы также можете добавить другие плагины PostCSS к процессу обработки. Например, [autoprefixer](https://github.com/postcss/autoprefixer) или [CSSNext](http://cssnext.io/).

## Использование файла конфигурации

`vue-loader` поддерживает файлы конфигурации PostCSS поддерживаемые с помощью [`postcss-loader`](https://github.com/postcss/postcss-loader#usage):

- `postcss.config.js`
- `.postcssrc`
- `postcss` поле в `package.json`

Рекомендуется использовать файл конфигурации, это позволяет использовать один и тот же конфиг для обработки ваших CSS файлов, обрабатываемых `postcss-loader` и CSS внутри `*.vue` файлов.

## Использование с `postcss-loader`

Поскольку `vue-loader` обрабатывает PostCSS внутри стилей своими силами, вам может потребоваться только применить `postcss-loader` к отдельным CSS-файлам. Нет необходимости указывать `lang="postcss"` в блоке стилей, если в вашем проекте есть конфигурационный файл PostCSS.

Иногда пользователь может захотеть использовать `lang="postcss"` только для целей подсветки синтаксиса. Начиная с версии 13.6.0, если никакой загрузчик не был явно настроен для частоиспользуемых расширений PostCSS (через собственную опцию `loaders` у `vue-loader`), они будут просто подвержены стандартной трансформации PostCSS в `vue-loader`:

- `postcss`
- `pcss`
- `sugarss`
- `sss`

## Указание настроек в опциях vue-loader

В качестве альтернативы, вы можете указать конфигурацию PostCSS специально для `*.vue` файлов с помощью опции `postcss` для `vue-loader`.

Пример использования с webpack 1.x:

``` js
// webpack.config.js
module.exports = {
  // другие настройки...
  vue: {
    // использование плагинов PostCSS
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
    // `module.rules` тоже самое, что и `module.loaders` в 1.x
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

### Отключение автозагрузки файла конфигурации

С версии `13.6.0+`, автозагрузку файла конфигурации postcss можно отключить с помощью опции `postcss.useConfigFile: false`:

``` js
postcss: {
  useConfigFile: false,
  plugins: [/* ... */],
  options: {/* ... */}
}
```

Это позволяет конфигурации postcss внутри файлов `*.vue` быть полностью конфигурируемой через inline-конфигурацию.