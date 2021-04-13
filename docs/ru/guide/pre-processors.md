---
sidebarDepth: 2
---

# Использование пре-процессоров

В webpack все пре-процессоры должны обрабатываться соответствующими загрузчиками. `vue-loader` позволяет вам использовать другие загрузчики webpack для обработки секций в однофайловых компонентах Vue. Они будут автоматически вызваны на основе указанного атрибута `lang` у секции файла.

## Sass

Например, для компиляции нашего тега `<style>` с помощью Sass/SCSS:

``` bash
npm install -D sass-loader node-sass
```

В вашей конфигурации webpack:

``` js
module.exports = {
  module: {
    rules: [
      // ... другие правила опущены

      // это правило будет применяться к обычным файлам `.scss`
      // А ТАКЖЕ к секциям `<style lang="scss">` в файлах `.vue`
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  // плагин опущен
}
```

Теперь, в дополнение к возможности писать `import 'style.scss'`, мы можем использовать SCSS также и в компонентах Vue:

``` html
<style lang="scss">
/* используем SCSS здесь */
</style>
```

Любое содержимое внутри блока будет обработано webpack, как если бы оно находилось внутри файла `*.scss`.

### Sass vs SCSS

Обратите внимание, что `sass-loader` обрабатывает синтаксис `scss` по умолчанию. Если вам требуется синтаксис `sass` с отступами, то необходимо передать опцию в загрузчик:

``` js
// webpack.config.js -> module.rules
{
  test: /\.sass$/,
  use: [
    'vue-style-loader',
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        indentedSyntax: true,
        // sass-loader >= 8
        sassOptions: {
          indentedSyntax: true
        }
      }
    }
  ]
}
```

### Передача глобальных переменных

`sass-loader` также поддерживает опцию `prependData`, которая позволяет вам передавать общие переменные во все обрабатываемые файлы без необходимости везде их явно импортировать:

``` js
// webpack.config.js -> module.rules
{
  test: /\.scss$/,
  use: [
    'vue-style-loader',
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        // вы можете также указать файл, например `variables.scss`
        // используйте свойство `prependData` здесь, если версия sass-loader = 8
        // используйте свойство `data` здесь, если версия sass-loader < 8
        additionalData: `$color: red;`
      }
    }
  ]
}
```

## LESS

``` bash
npm install -D less less-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.less$/,
  use: [
    'vue-style-loader',
    'css-loader',
    'less-loader'
  ]
}
```

## Stylus

``` bash
npm install -D stylus stylus-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.styl(us)?$/,
  use: [
    'vue-style-loader',
    'css-loader',
    'stylus-loader'
  ]
}
```

## PostCSS

::: tip СОВЕТ
Vue Loader v15 больше не применяет трансформацию PostCSS по умолчанию. Вам необходимо использовать PostCSS через `postcss-loader`.
:::

``` bash
npm install -D postcss-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.css$/,
  use: [
    'vue-style-loader',
    {
      loader: 'css-loader',
      options: { importLoaders: 1 }
    },
    'postcss-loader'
  ]
}
```

Конфигурация PostCSS может быть выполнена через `postcss.config.js` или опции `postcss-loader`. Подробнее можно прочитать в [документации postcss-loader](https://github.com/postcss/postcss-loader).

`postcss-loader` может также применяться в комбинации с другими пре-процессорами, указанными выше.

## Babel

``` bash
npm install -D babel-core babel-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.js?$/,
  loader: 'babel-loader'
}
```

Конфигурация Babel может быть выполнена через `.babelrc` или опции `babel-loader`.

### Исключение node_modules

Обычная практика, указывать `exclude: /node_modules/` для правил транспиляции JS (например, `babel-loader`) которые применяются к файлам `.js`. Из-за изменений версии v15, если вы импортируете однофайловые компоненты SFC внутри `node_modules`, его секция `<script>` также будет исключена из транспиляции.

Чтобы обеспечить транспиляцию JS для однофайловых компонентов Vue в `node_modules`, вам необходимо добавить для них исключение с помощью функции в опции exclude:

``` js
{
  test: /\.js$/,
  loader: 'babel-loader',
  exclude: file => (
    /node_modules/.test(file) &&
    !/\.vue\.js/.test(file)
  )
}
```

## TypeScript

``` bash
npm install -D typescript ts-loader
```

``` js
// webpack.config.js
module.exports = {
  resolve: {
    // Добавляем `.ts` как обрабатываемое расширение.
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      // ... другие правила опущены
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] }
      }
    ]
  },
  // ... плагин опущен
}
```

Конфигурация TypeScipt может быть выполнена через `tsconfig.json`. Также смотрите документацию для [ts-loader](https://github.com/TypeStrong/ts-loader).

## Pug

Обработка шаблонов несколько отличается, потому что большинство загрузчиков webpack для шаблонов, такие как `pug-loader`, возвращают функцию шаблона вместо скомпилированной строки HTML. Вместо использования `pug-loader` мы должны использовать загрузчик, который вернёт сырую строку HTML, например `pug-plain-loader`:

``` bash
npm install -D pug pug-plain-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.pug$/,
  loader: 'pug-plain-loader'
}
```

Теперь вы можете писать:

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

Если вы также собираетесь импортировать файлы `.pug` как HTML-строки в JavaScript, вам нужно добавить в цепочку `raw-loader` после загрузчика пре-процессора. Обратите внимание, что добавление `raw-loader` сломает использование в компонентах Vue, поэтому потребуется два правила: одно для файлов Vue с использованием `resourceQuery`, другое (fallback) для импортов из JavaScript:

``` js
// webpack.config.js -> module.rules
{
  test: /\.pug$/,
  oneOf: [
    // это применяется к `<template lang="pug">` в компонентах Vue
    {
      resourceQuery: /^\?vue/,
      use: ['pug-plain-loader']
    },
    // это применяется к импортам pug внутри JavaScript
    {
      use: ['raw-loader', 'pug-plain-loader']
    }
  ]
}
```
