# Перечень настроек

## Отличия в использовании с Webpack 1 & 2

Для Webpack 2: настройки можно передавать непосредственно в правилах загрузчиков.

``` js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // настройки vue-loader
        }
      }
    ]
  }
}
```

Для Webpack 1.x: добавить блок `vue` в корень конфигурации Webpack:

``` js
module.exports = {
  // ...
  vue: {
    // настройки vue-loader
  }
}
```

### loaders

- Тип: `{ [lang: string]: string }`

  Объект определяющий какие загрузчики Webpack переопределят стандартные загрузчики, используемые для обработки секций `*.vue` файлов. Ключ соответствует атрибуту `lang` у секции файла, если таковой был указан. Значения `lang` по умолчанию:

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  Например, чтобы использовать `babel-loader` и `eslint-loader` для обработки всех секций `<script>`:

  ``` js
  // Конфигурация Webpack 2.x
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader!eslint-loader'
          }
        }
      }
    ]
  }
  ```

### preLoaders

- Тип: `{ [lang: string]: string }`
- поддерживается только в версиях >=10.3.0

  Конфигурация подобна как и в `loaders`, но `preLoaders` будут применены к соответствующим секциям перед стандартными загрузчиками. Вы можете использовать это для предварительной обработки секций - например для локализации на этапе сборки.

### postLoaders

- Тип: `{ [lang: string]: string }`
- поддерживается только в версиях >=10.3.0

  Конфигурация подобна как и в `loaders`, но `postLoaders` применяются после загрузчиков по умолчанию. Вы можете использовать это для пост-обработки языков. Обратите внимание, что тем не менее всё несколько сложнее:

  - Для `html`, результат возвращаемый стандартным загрузчиком будет скомпилированный в JavaScript код render-функции.

  - Для `css`, результат возвращаемый из `vue-style-loader`,что не является особенно полезным в большинстве случаев. Использование postcss-плагина будет лучшим вариантом.

### postcss

> Примечание: в версиях >=11.0.0 рекомендуется использовать файл конфигурации PostCSS вместо описания секции. [Использование аналогично как в `postcss-loader`](https://github.com/postcss/postcss-loader#usage).

- Тип: `Array` или `Function` или `Object`

  Определяет список плагинов PostCSS, которые будут применяться к CSS внутри `*.vue` файлов. Если используется функция, то она будет вызвана в контексте того же loader'а и должна возвращать массив плагинов.

  ``` js
  // ...
  {
    loader: 'vue-loader',
    options: {
      // примечание: не вкладывайте опции `postcss` внутри `loaders`
      postcss: [require('postcss-cssnext')()],
      loaders: {
        // ...
      }
    }
  }
  ```

  Эта опция также может быть объектом, который содержит настройки для PostCSS. Это пригодится в проектах с PostCSS, где используются собственные парсеры/сериализаторы:

  ``` js
  postcss: {
    plugins: [...], // список плагинов
    options: {
      parser: sugarss // использование парсера sugarss
    }
  }
  ```

### cssSourceMap

- Тип: `Boolean`
- По умолчанию: `true`

  Использование source maps для CSS. Отключение этой опции может позволить избежать некоторых багов с относительными путями в `css-loader` и сделать сборку немного быстрее.

  Обратите внимание, эта опция автоматически устанавливается в `false` при отсутствии опции `devtool` в файле конфигурации Webpack.

### esModule

- Тип: `Boolean`
- По умолчанию: `undefined`

  Генерация esModule совместимого кода. По умолчанию vue-loader генерирует модули в формате commonjs `module.exports = ....`. Когда опция `esModule` установлена в true, экспорт по умолчанию (default export) будет преобразован в `exports.__esModule = true; exports = ...`. Это может быть полезным для настройки взаимодействия с транспиляторами, отличными от  Babel, как например TypeScript.

### preserveWhitespace

- Тип: `Boolean`
- По умолчанию: `true`

  При установке в `false` пробельные символы между HTML тегами в шаблонах будут проигнорированы.

### transformToRequire

- Тип: `{ [tag: string]: string | Array<string> }`
- По умолчанию: `{ img: 'src' }`

  Во время компиляции шаблона, компилятор может преобразовывать определённые атрибуты, такие как `src` в ссылках, в вызовы `require`, таким образом чтобы файл обрабатывался с помощью Webpack. Конфигурация по умолчанию преобразует `src` атрибуты внутри тегов `<img>`.

### buble

- Тип: `Object`
- По умолчанию: `{}`

  Настройка параметров для `buble-loader` (если он присутствует), и buble-компиляции для шаблонов рендер-функций.

  > Примечание: в версиях 9.x, выражения шаблонов настраивались отдельно через опцию `templateBuble`, которая удалена в новых версиях.

  Компиляция шаблонов рендер-функций поддерживает специальное преобразование `stripWith` (включена по умолчанию), которая удаляет использование `with` в генерируемых рендер-функциях для соответствия режиму strict.

  Пример конфигурации:

  ``` js
  // webpack 1
  vue: {
    buble: {
      // enable object spread operator
      // ПРИМЕЧАНИЕ: вам нужно самостоятельно подключить полифилл для Object.assign!
      objectAssign: 'Object.assign',

      // отключение удаления `with`
      transforms: {
        stripWith: false
      }
    }
  }

  // webpack 2
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          buble: {
            // теже настройки
          }
        }
      }
    ]
  }
  ```

### extractCSS

> Добавлено в версии 12.0.0

Автоматически извлекает CSS с помощью `extract-text-webpack-plugin`. Работает для большинства пре-процессоров из коробки и минифицирует при сборке в production.

Передаваемое значение может быть `true`, или экземпляром плагина (так что вы можете использовать несколько экземпляров extract plugin для разных извлекаемых файлов).

Это должно использоваться только в production, чтобы горячая перезагрузка модулей работала в процессе разработки.

Например:

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

Или можно передать экземпляр плагина:

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var plugin = new ExtractTextPlugin("style.css")

module.exports = {
  // другие настройки...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: plugin
        }
      }
    ]
  },
  plugins: [
    plugin
  ]
}
```