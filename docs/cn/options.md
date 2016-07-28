# Options Reference

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

### autoprefixer

- type: `Boolean`
- default: `true`

  Whether to enable autoprefixer for CSS inside `*.vue` files.

### postcss

- type: `Array` or `Function` or `Object`
- `Object` format only supported in ^8.5.0

  Specify custom PostCSS plugins to be applied to CSS inside `*.vue` files. If using a function, the function will called using the same loader context and should return an Array of plugins.

  ``` js
  // ...
  vue: {
    // note: do not nest the `postcss` option under `loaders`
    postcss: [require('postcss-cssnext')()],
    autoprefixer: false,
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

### template

- ^8.4.0
- type: `Object`

  Pass options to the template rendering engine (via [consolidate](https://github.com/tj/consolidate.js)) if you are using a non-html templating language.
