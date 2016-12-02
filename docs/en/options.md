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

For Webpack 2: use `webpack.LoaderOptionsPlugin`:

``` js
module.exports = {
  // ...
  plugins: [
    new webpack.LoaderOptionsPlugin({
      vue: {
        // vue-loader options
      }
    })
  ]
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
