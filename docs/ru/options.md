# Перечень опций

## Отличия в использовании с Webpack 1 & 2

Для Webpack 1.x: добавить блок `vue` в корень конфигурации Webpack:

``` js
module.exports = {
  // ...
  vue: {
    // настройки vue-loader
  }
}
```

Для Webpack 2 (^2.1.0-beta.25):

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

### loaders

- Тип: `Object`

  An object specifying Webpack loaders to use for language blocks inside `*.vue` files. The key corresponds to the `lang` attribute for language blocks, if specified. The default `lang` for each type is:

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  For example, to use `babel-loader` and `eslint-loader` to process all `<script>` blocks:

  ``` js
  // ...
  vue: {
    loaders: {
      js: 'babel!eslint'
    }
  }
  ```

### postcss

- Тип: `Array` или `Function` или `Object`
- `Object` поддерживается в версиях 8.5.0 и выше

  Specify custom PostCSS plugins to be applied to CSS inside `*.vue` files. If using a function, the function will called using the same loader context and should return an Array of plugins.

  ``` js
  // ...
  vue: {
    // примечание: не добавляйте опцию `postcss` после `loaders`
    postcss: [require('postcss-cssnext')()],
    loaders: {
      // ...
    }
  }
  ```

  This option can also be an object that contains options to be passed to the PostCSS processor. This is useful when you are using PostCSS projects that relies on custom parser/stringifiers:

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

  Whether to enable source maps for CSS. Disabling this can avoid some relative path related bugs in `css-loader` and make the build a bit faster.

  Note this is automatically set to `false` if the `devtool` option is not present in the main Webpack config.

### esModule

- Тип: `Boolean`
- По умолчанию: `undefined`

  Whether to emit esModule compatible code. By default vue-loader will emit default export in commonjs format like `module.exports = ....`. When `esModule` is set to true, default export will be transpiled into `exports.__esModule = true; exports = ...`. Useful for interoperating with transpiler other than Babel, like TypeScript.

### preserveWhitespace

- Тип: `Boolean`
- По умолчанию: `true`

  При установке в `false`, пробельные символы между HTML тегами в шаблонах будут проигнорированы.

### transformToRequire

- Тип: `{ [tag: string]: string | Array<string> }`
- По умолчанию: `{ img: 'src' }`

  During template compilation, the compiler can transform certain attributes, such as `src` URLs, into `require` calls, so that the target asset can be handled by Webpack. The default config transforms the `src` attribute on `<img>` tags.

### buble

- Тип: `Object`
- По умолчанию: `{}`

  Configure options for `buble-loader` (if present), AND the buble compilation pass for template render functions.

  > Примечание: in version 9.x, the template expressions are configured separately via the now removed `templateBuble` option.

  The template render functions compilation supports a special transform `stripWith` (enabled by default), which removes the `with` usage in generated render functions to make them strict-mode compliant.

  Пример конфигурации:

  ``` js
  // webpack 1
  vue: {
    buble: {
      // enable object spread operator
      // ПРИМЕЧАНИЕ: вам нужно самостоятельно добавить полифилл для Object.assign!
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
