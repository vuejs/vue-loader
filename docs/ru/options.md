# Перечень настроек

## Отличия в использовании с webpack 1 & 2

Для webpack 2: настройки можно передавать непосредственно в правилах загрузчиков.

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

Для webpack 1.x: добавить блок `vue` в корень конфигурации webpack:

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

  Объект определяющий какие загрузчики webpack переопределят стандартные загрузчики, используемые для обработки секций `*.vue` файлов. Ключ соответствует атрибуту `lang` у секции файла, если таковой был указан. Значения `lang` по умолчанию:

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  Например, чтобы использовать `babel-loader` и `eslint-loader` для обработки всех секций `<script>`:

  ``` js
  // Конфигурация webpack 2.x
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
- поддерживается только в версиях 10.3.0+

  Конфигурация подобна как и в `loaders`, но `preLoaders` будут применены к соответствующим секциям перед стандартными загрузчиками. Вы можете использовать это для предварительной обработки секций - например для локализации на этапе сборки.

### postLoaders

- Тип: `{ [lang: string]: string }`
- поддерживается только в версиях 10.3.0+

  Конфигурация подобна как и в `loaders`, но `postLoaders` применяются после загрузчиков по умолчанию. Вы можете использовать это для пост-обработки языков. Обратите внимание, что тем не менее всё несколько сложнее:

  - Для `html`, результат возвращаемый стандартным загрузчиком будет скомпилированный в JavaScript код render-функции.

  - Для `css`, результат возвращаемый из `vue-style-loader`,что не является особенно полезным в большинстве случаев. Использование postcss-плагина будет лучшим вариантом.

### postcss

> Примечание: в версиях 11.0.0+ рекомендуется использовать файл конфигурации PostCSS вместо описания секции. [Использование аналогично как в `postcss-loader`](https://github.com/postcss/postcss-loader#usage).

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

### postcss.config

> Добавлено в версии 13.2.1

- Тип: `Object`
- По умолчанию: `undefined`

  Эта опция позволяет настроить конфигурацию PostCSS, таким же образом как и [postcss-loader](https://github.com/postcss/postcss-loader#config-1).

  - **postcss.config.path**

    Указывает путь (файл или каталог) для загрузки конфигурационного файла PostCSS.

    ```js
    postcss: {
      config: {
        path: path.resolve('./src')
      }
    }
    ```

  - **postcss.config.ctx**

    Предоставляет контекст для плагинов PostCSS. См. подробнее в [документации postcss-loader](https://github.com/postcss/postcss-loader#context-ctx).

### cssSourceMap

- Тип: `boolean`
- По умолчанию: `true`

  Использование source maps для CSS. Отключение этой опции может позволить избежать некоторых багов с относительными путями в `css-loader` и сделать сборку немного быстрее.

  Обратите внимание, эта опция автоматически устанавливается в `false` при отсутствии опции `devtool` в файле конфигурации webpack.

### esModule

- Тип: `boolean`
- По умолчанию: `true` (v13.0+)

  Генерация esModule совместимого кода. По умолчанию vue-loader генерирует модули в формате commonjs `module.exports = ....`. Когда опция `esModule` установлена в true, экспорт по умолчанию (default export) будет преобразован в `exports.__esModule = true; exports = ...`. Это может быть полезным для настройки взаимодействия с транспиляторами, отличными от  Babel, как например TypeScript.

> Примечание: до версии v12.x, значение по умолчанию `false`.

### preserveWhitespace

- Тип: `boolean`
- По умолчанию: `true`

  При установке в `false` пробельные символы между HTML тегами в шаблонах будут проигнорированы.

### compilerModules

- Тип: `Array<ModuleOptions>`
- По умолчанию: `[]`

  Настройка опции `modules` для `vue-template-compiler`. См. подробнее в документации `vue-template-compiler` [опция `modules`](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options).

### compilerDirectives

- Тип: `{ [tag: string]: Function }`
- По умолчанию: `{}` (v13.0.5+)

  > Примечание: в версиях v12.x поддержка добавлена с v12.2.3+

  Настройка опции `directives` для `vue-template-compiler`. См. подробнее в документации `vue-template-compiler` [опция `directives`](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options).

### transformToRequire

- Тип: `{ [tag: string]: string | Array<string> }`
- По умолчанию: `{ img: 'src' }`

  Во время компиляции шаблона, компилятор может преобразовывать определённые атрибуты, такие как `src` в ссылках, в вызовы `require`, таким образом чтобы файл обрабатывался с помощью webpack. Конфигурация по умолчанию преобразует `src` атрибуты внутри тегов `<img>`.

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

- Тип: `boolean`
- По умолчанию: `false`

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

### optimizeSSR

> Добавлено в версии 12.1.1

- Тип: `boolean`
- По умолчанию: `true` когда конфигурация webpack имеет `target: 'node'` и версия `vue-template-compiler` 2.4.0 или выше.

Включает оптимизацию компиляции в Vue 2.4 SSR, которая компилирует в простые строки часть деревьев vdom возвращаемых render-функциями, что улучшает производительность SSR. В некоторых случаях вам может потребоваться явно отключить оптимизацию, поскольку результирующие render-функции могут быть использованы только для SSR и не могут использоваться для рендеринга на стороне клиента или тестирования.

### cacheBusting

> Добавлено в версии 13.2.0

- Тип: `boolean`
- По умолчанию: `true` в режиме разработки, `false` в режиме production.

Генерировать ли source maps при перезагрузке кэша, добавив хэш-запрос в имени файла. Выключение этой опции может помочь при отладке с использованием source map.

### hotReload

> Добавлено в версии 13.5.0

- Тип: `boolean`
- По умолчанию: `true` в режиме разработки, `false` в режиме production или при установленной опции `target: 'node'` в конфигурации webpack.
- Разрешённые значения: `false` (`true` не заставит работать горячую замену ни в режиме production, ни когда `target: 'node'`)

Использование возможности webpack по [горячей замене модулей](https://webpack.js.org/concepts/hot-module-replacement/) позволяет применять изменения в браузере **без необходимости обновления страницы**.
Используйте эту опцию (со значением `false`) чтобы отключить горячую замену в режиме разработки.
