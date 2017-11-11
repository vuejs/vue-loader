# Options Reference

## Usage Difference Between webpack 1 & 2

For webpack 2: pass the options directly to the loader rule.

``` js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // vue-loader options
        }
      }
    ]
  }
}
```

For webpack 1.x: add a root `vue` block in your webpack config.

``` js
module.exports = {
  // ...
  vue: {
    // vue-loader options
  }
}
```

### loaders

- type: `{ [lang: string]: string }`

  An object specifying webpack loaders to overwrite the default loaders used for language blocks inside `*.vue` files. The key corresponds to the `lang` attribute for language blocks, if specified. The default `lang` for each type is:

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  For example, to use `babel-loader` and `eslint-loader` to process all `<script>` blocks:

  ``` js
  // webpack 2.x config
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

- type: `{ [lang: string]: string }`
- only supported in 10.3.0+

  The config format is the same as `loaders`, but `preLoaders` are applied to corresponding language blocks before the default loaders. You can use this to pre-process language blocks - a common use case would be build-time i18n.

### postLoaders

- type: `{ [lang: string]: string }`
- only supported in 10.3.0+

  The config format is the same as `loaders`, but `postLoaders` are applied after the default loaders. You can use this to post-process language blocks. However note that this is a bit more complicated:

  - For `html`, the result returned by the default loader will be compiled JavaScript render function code.

  - For `css`, the result will be returned by `vue-style-loader` which isn't particularly useful in most cases. Using a postcss plugin will be a better option.

### postcss

> Note: in 11.0.0+ it is recommended to use a PostCSS config file instead. [The usage is the same as `postcss-loader`](https://github.com/postcss/postcss-loader#usage).

- type: `Array` or `Function` or `Object`

  Specify custom PostCSS plugins to be applied to CSS inside `*.vue` files. If using a function, the function will called using the same loader context and should return an Array of plugins.

  ``` js
  // ...
  {
    loader: 'vue-loader',
    options: {
      // note: do not nest the `postcss` option under `loaders`
      postcss: [require('postcss-cssnext')()],
      loaders: {
        // ...
      }
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

### postcss.config

> New in 13.2.1

- type: `Object`
- default: `undefined`

  This field allows customizing PostCSS config in the same way as [postcss-loader](https://github.com/postcss/postcss-loader#config-1).

  - **postcss.config.path**

    Specify a path (file or directory) to load the PostCSS config file from.

    ``` js
    postcss: {
      config: {
        path: path.resolve('./src')
      }
    }
    ```

  - **postcss.config.ctx**

    Provide context to PostCSS plugins. See [postcss-loader docs](https://github.com/postcss/postcss-loader#context-ctx) for more details.

### cssSourceMap

- type: `boolean`
- default: `true`

  Whether to enable source maps for CSS. Disabling this can avoid some relative path related bugs in `css-loader` and make the build a bit faster.

  Note this is automatically set to `false` if the `devtool` option is not present in the main webpack config.

### esModule

- type: `boolean`
- default: `true` (v13.0+)

  Whether to emit esModule compatible code. By default vue-loader will emit default export in commonjs format like `module.exports = ....`. When `esModule` is set to true, default export will be transpiled into `exports.__esModule = true; exports = ...`. Useful for interoperating with transpiler other than Babel, like TypeScript.

  > version note: up to v12.x, default value is `false`.

### preserveWhitespace

- type: `boolean`
- default: `true`

  If set to `false`, the whitespaces between HTML tags in templates will be ignored.

### compilerModules

- type: `Array<ModuleOptions>`
- default: `[]`

  Configure `modules` options for `vue-template-compiler`. In about details, see more [`modules` option](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options) of `vue-template-compiler`.

### compilerDirectives

- type: `{ [tag: string]: Function }`
- default: `{}` (v13.0.5+)

  > version note: in v12.x, supported in v12.2.3+

  Configure `directives` options for `vue-template-compiler`, In about details, see more [`directives` option](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options) of `vue-template-compiler`.

### transformToRequire

- type: `{ [tag: string]: string | Array<string> }`
- default: `{ img: 'src', image: 'xlink:href' }`

  During template compilation, the compiler can transform certain attributes, such as `src` URLs, into `require` calls, so that the target asset can be handled by webpack. The default config transforms the `src` attribute on `<img>` tags and `xlink:href` attribute on `<image>` tags of SVG.

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
        loader: 'vue-loader',
        options: {
          buble: {
            // same options
          }
        }
      }
    ]
  }
  ```

### extractCSS

> New in 12.0.0

- type: `boolean`
- default: `false`

Automatically extracts the CSS using `extract-text-webpack-plugin`. Works for most pre-processors out of the box, and handles minification in production as well.

The value passed in can be `true`, or an instance of the plugin (so that you can use multiple instances of the extract plugin for multiple extracted files).

This should be only used in production so that hot-reload works during development.

Example:

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // other options...
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

Or passing in an instance of the plugin:

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var plugin = new ExtractTextPlugin("style.css")

module.exports = {
  // other options...
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

> New in 12.1.1

- type: `boolean`
- default: `true` when the webpack config has `target: 'node'` and `vue-template-compiler` is at version 2.4.0 or above.

Enable Vue 2.4 SSR compilation optimization that compiles part of the vdom trees returned by render functions into plain strings, which improves SSR performance. In some cases you might want to explicitly turn it off because the resulting render functions can only be used for SSR and cannot be used for client-side rendering or testing.

### cacheBusting

> New in 13.2.0

- type: `boolean`
- default: `true` in development mode, `false` in production mode.

Whether generate source maps with cache busting by appending a hash query to the file name. Turning this off can help with source map debugging.

### hotReload

> New in 13.5.0

- type: `boolean`
- default: `true` in development mode, `false` in production mode or when the webpack config has `target: 'node'`.
- allowed value: `false` (`true` will not force Hot Reload neither in production mode nor when `target: 'node'`)

Whether to use webpack [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) to apply changes in the browser **without reloading the page**.
Use this option (value `false`) to disable the Hot Reload feature in development mode.
