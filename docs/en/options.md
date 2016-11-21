# Options Reference

## Usage Difference Between Webpack 1 & 2

For Webpack 1.x: add a root `vue` block in your Webpack config:

``` js
module.exports = {
  // ...
  vue: {
    // vue-loader options
  }
}
```

For Webpack 2 (^2.1.0-beta.25):

``` js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          // vue-loader options
        }
      }
    ]
  }
}
```

### loaders

- type: `Object`

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

- type: `Array` or `Function` or `Object`
- `Object` format only supported in ^8.5.0

  Specify custom PostCSS plugins to be applied to CSS inside `*.vue` files. If using a function, the function will called using the same loader context and should return an Array of plugins.

  ``` js
  // ...
  vue: {
    // note: do not nest the `postcss` option under `loaders`
    postcss: [require('postcss-cssnext')()],
    loaders: {
      // ...
    }
  }
  ```

  This option can also be an object that contains options to be passed to the PostCSS processor. This is useful when you are using PostCSS projects that relies on custom parser/stringifiers:

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: sugarss // use sugarss parser
    }
  }
  ```

### cssSourceMap

- type: `Boolean`
- default: `true`

  Whether to enable source maps for CSS. Disabling this can avoid some relative path related bugs in `css-loader` and make the build a bit faster.

  Note this is automatically set to `false` if the `devtool` option is not present in the main Webpack config.

### esModule

- type: `Boolean`
- default: `undefined`

  Whether to emit esModule compatible code. By default vue-loader will emit default export in commonjs format like `module.exports = ....`. When `esModule` is set to true, default export will be transpiled into `exports.__esModule = true; exports = ...`. Useful for interoperating with transpiler other than Babel, like TypeScript.

### preserveWhitespace

- type: `Boolean`
- default: `true`

  If set to `false`, the whitespaces between HTML tags in templates will be ignored.

### transformToRequire

- type: `{ [tag: string]: string | Array<string> }`
- default: `{ img: 'src' }`

  During template compilation, the compiler can transform certain attributes, such as `src` URLs, into `require` calls, so that the target asset can be handled by Webpack. The default config transforms the `src` attribute on `<img>` tags.

### buble

- type: `Object`
- default: `{}`

  Configure options for `buble-loader` (if present), AND the buble compilation pass for template render functions.

  > version note: in version 9.x, the template expressions are configured separately via the now removed `templateBuble` option.

  The template render functions compilation supports a special transform `stripWith` (enabled by default), which removes the `with` usage in generated render functions to make them strict-mode compliant.

  Example configuration:

  ``` js
  // webpack 1
  vue: {
    buble: {
      // enable object spread operator
      // NOTE: you need to provide Object.assign polyfill yourself!
      objectAssign: 'Object.assign',

      // turn off the `with` removal
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
        loader: 'vue',
        options: {
          buble: {
            // same options
          }
        }
      }
    ]
  }
  ```
