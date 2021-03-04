---
sidebar: auto
sidebarDepth: 2
---

# Миграция с версии v14

::: tip Будьте внимательны
Мы в процессе обновления Vue CLI 3 beta для использования webpack 4 + Vue Loader v15, поэтому вы можете захотеть подождать, если планируете переход на Vue CLI 3.
:::

## Важные изменения

### Необходимо установить плагин

Vue Loader v15 теперь для правильной работы требуется прилагаемый плагин webpack:

``` js
// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  // ...
  plugins: [
    new VueLoaderPlugin()
  ]
}
```

### Определение загрузчиков webpack

Vue Loader v15 теперь использует другую стратегию для определения загрузчиков, которые должны использоваться для языкового блока.

Рассмотрим `<style lang="less">` для примера: в версии v14 и ниже, он попытается загрузить блок с помощью `less-loader`, и неявно добавляет в цепочку загрузчиков `css-loader` и `vue-style-loader` после него, используя инлайновые-строки с указанием загрузчиков.

С версии v15, `<style lang="less">` будет вести себя так, как если бы это был загруженный файл `*.less` . Поэтому, чтобы обработать его, вам нужно предоставить явное правило в вашей основной конфигурации webpack:

``` js
{
  module: {
    rules: [
      // ... другие правила
      {
        test: /\.less$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'less-loader'
        ]
      }
    ]
  }
}
```

Преимущество состоит в том, что это же правило также применяется и к обычным импортам `*.less` из JavaScript, и вы можете конфигурировать опции для этих загрузчиков так как захотите. В версии v14 и ниже, если вы хотите предоставить пользовательские опции для предполагаемого загрузчика, то вам необходимо дублировать их в собственной опции `loaders` у Vue Loader. С версии v15 это больше не требуется.

Версия v15 также позволяет использовать не-сериализуемые опции для загрузчиков, что было невозможно в предыдущих версиях.

### Импорт однофайловых компонентов из зависимостей

Обычная практика, указывать `exclude: /node_modules/` для правил транспиляции JS (например, `babel-loader`) которые применяются к файлам `.js`. Из-за изменения версии v15, если вы импортируете однофайловые компоненты SFC внутри `node_modules`, его секция `<script>` также будет исключена из транспиляции.

Чтобы обеспечить транспиляцию JS для однофайловых компонентов Vue в `node_modules`, вам необходимо делать для них исключение с помощью функции в опции exclude:

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

### Обработка секций шаблонов

v14 и ниже использует [consolidate](https://github.com/tj/consolidate.js/) для компиляции `<template lang="xxx">`. v15 теперь обрабатывает их с помощью загрузчиков webpack.

Обратите внимание, что некоторые загрузчики шаблонов, такие как `pug-loader` возвращают функцию шаблона вместо скомпилированной строки HTML. Для того чтобы передать корректное содержимое в компилятор шаблонов Vue, вам необходимо использовать загрузчики, которые вместо этого возвращают простой HTML. Например, для поддержки `<template lang="pug">`, вы можете использовать [pug-plain-loader](https://github.com/yyx990803/pug-plain-loader):

``` js
{
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
      }
    ]
  }
}
```

Если вы также собираетесь импортировать файлы `.pug` как HTML-строки в JavaScript, вам нужно будет добавить в цепочку `raw-loader` после загрузчика пре-процессора. Обратите внимание, что добавление `raw-loader` сломает использование в компонентах Vue, поэтому вам потребуется два правила, одно направленное на файлы Vue с использованием `resourceQuery`, другое (fallback) нацеленное на импорты JavaScript:

``` js
{
  module: {
    rules: [
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
    ]
  }
}
```

### Внедрение стилей

Внедрение стилей на стороне клиента теперь внедряет все стили заранее, чтобы обеспечить консистентное поведение между режимом разработки и режимом, когда CSS извлекается в отдельный файл.

Обратите внимание, что порядок внедрения всё ещё не гарантируется, поэтому вам следует избегать написания CSS, который зависит от порядка внедрения.

### PostCSS

Vue Loader больше не применяет трансформацию PostCSS по умолчанию. Для использования PostCSS сконфигурирйте `postcss-loader` таким образом, как и для обычных CSS файлов.

### CSS модули

CSS модули теперь должны явно настраиваться через опцию `css-loader`. Атрибут `module` на тегах `<style>` по-прежнему необходим для локального внедрения в компонент.

Хорошая новость в том, что теперь вы можете настраивать `localIdentName` в одном месте:

``` js
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'vue-style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]_[hash:base64:8]'
            }
          }
        ]
      }
    ]
  }
}
```

Если вы хотите использовать CSS модули только в некоторых компонентах Vue, вы можете использовать правило `oneOf` и проверять наличие строки `module` внутри `resourceQuery`:

``` js
{
  test: /\.css$/,
  oneOf: [
    // это соответствует `<style module>`
    {
      resourceQuery: /module/,
      use: [
        'vue-style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[local]_[hash:base64:5]'
          }
        }
      ]
    },
    // это соответствует простому `<style>` или `<style scoped>`
    {
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }
  ]
}
```

## Извлечение CSS в отдельный файл

Работает аналогично тому, как вы бы настроили его для обычного CSS. Пример использования с помощью [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin):

``` js
{
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.css$/,
        // или `ExtractTextWebpackPlugin.extract(...)`
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'output.css'
    })
  ]
}
```

## SSR externals

В SSR, мы обычно используем `webpack-node-externals` для исключения npm-зависимостей из серверной сборки. Если вам необходимо импортировать CSS из npm-зависимости, то предыдущим решением было указать белый список, например так:

``` js
// конфигурация webpack
externals: nodeExternals({
  whitelist: /\.css$/
})
```

С версии v15, импорты для `<style src="dep/foo.css">` получают строку `resourceQuery`, добавленную в конце запроса, поэтому вам потребуется обновить белый список так:

``` js
externals: nodeExternals({
  whitelist: [/\.css$/, /\?vue&type=style/]
})
```

## Устаревшие опции

Следующие опции объявлены устаревшими и должны настраиваться с использованием обычных правил модулей webpack:

- `loader`
- `preLoaders`
- `postLoaders`
- `postcss`
- `cssSourceMap`
- `buble`
- `extractCSS`
- `template`

Следующие опции объявлены устаревшими и должны настраиваться с помощью новой опции `compilerOptions`:

- `preserveWhitespace` (используйте `compilerOptions.preserveWhitespace`)
- `compilerModules` (используйте `compilerOptions.modules`)
- `compilerDirectives` (используйте `compilerOptions.directives`)

Следующие опции были переименованы:

- `transformToRequire` (переименована в `transformAssetUrls`)

:::tip СОВЕТ
Полный список новых опций можно посмотреть [на странице настроек](./options.md).
:::
