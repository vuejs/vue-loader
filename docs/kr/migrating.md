---
sidebar: auto
sidebarDepth: 2
---

# Migrating from v14

::: tip Heads Up
We are in the process of upgrading Vue CLI 3 beta to use webpack 4 + Vue Loader v15, so you might want to wait if you are planning to upgrade to Vue CLI 3.
:::

## Notable Breaking Changes

### A Plugin is Now Required

Vue Loader v15 now requires an accompanying webpack plugin to function properly:

``` js
// webpack.config.js
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  // ...
  plugins: [
    new VueLoaderPlugin()
  ]
}
```

### Loader Inference

Vue Loader v15 now uses a different strategy to infer loaders to use for language blocks.

Take `<style lang="less">` as an example: in v14 and below, it will attempt to load the block with `less-loader`, and implicitly chains `css-loader` and `vue-style-loader` after it, all using inline loader strings.

In v15, `<style lang="less">` will behave as if it's an actual `*.less` file being loaded. So, in order to process it, you need to provide an explicit rule in your main webpack config:

``` js
{
  module: {
    rules: [
      // ... other rules
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

The benefit is that this same rule also applies to plain `*.less` imports from JavaScript, and you can configure options for these loaders anyway you want. In v14 and below, if you want to provide custom options to an inferred loader, you'd have to duplicate it under Vue Loader's own `loaders` option. In v15 it is no longer necessary.

v15 also allows using non-serializable options for loaders, which was not possible in previous versions.

### Importing SFCs from Dependencies

It is common to have `exclude: /node_modules/` for JS transpilation rules (e.g. `babel-loader`) that apply to `.js` files. Due to the inference change of v15, if you import a Vue SFC inside `node_modules`, its `<script>` part will be excluded from transpilation as well.

In order to ensure JS transpilation is applied to Vue SFCs in `node_modules`, you need to whitelist them by using an exclude function instead:

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

### Template Preprocessing

v14 and below uses [consolidate](https://github.com/tj/consolidate.js/) to compile `<template lang="xxx">`. v15 now applies preprocessing for them using webpack loaders instead.

Note that some template loaders such as `pug-loader` exports a compiled templating function instead of plain HTML. In order to pass the correct content to Vue's template compiler, you must use a loader that outputs plain HTML instead. For example, to support `<template lang="pug">`, you can use [pug-plain-loader](https://github.com/yyx990803/pug-plain-loader):

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

If you also intend to use it to import `.pug` files as HTML strings in JavaScript, you will need to chain `raw-loader` after the preprocessing loader. Note however adding `raw-loader` would break the usage in Vue components, so you need to have two rules, one of them targeting Vue files using a `resourceQuery`, the other one (fallback) targeting JavaScript imports:

``` js
{
  module: {
    rules: [
      {
        test: /\.pug$/,
        oneOf: [
          // this applies to `<template lang="pug">` in Vue components
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader']
          },
          // this applies to pug imports inside JavaScript
          {
            use: ['raw-loader', 'pug-plain-loader']
          }
        ]
      }
    ]
  }
}
```

### Style Injection

Client-side style injection now injects all styles upfront to ensure consistent behavior between development and extracted mode.

Note the injection order is still not guaranteed, so you should avoid writing CSS that relies on insertion order.

### PostCSS

Vue Loader no longer auto applies PostCSS transforms. To use PostCSS, configure `postcss-loader` the same way you would for normal CSS files.

### CSS Modules

CSS Modules now need to be explicitly configured via `css-loader` options. The `module` attribute on `<style>` tags is still needed for locals injection into the component.

The good news is that you can now configure `localIdentName` in one place:

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

If you only want to use CSS Modules in some of your Vue components, you can use a `oneOf` rule and check for the `module` string in `resourceQuery`:

``` js
{
  test: /\.css$/,
  oneOf: [
    // this matches `<style module>`
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
    // this matches plain `<style>` or `<style scoped>`
    {
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }
  ]
}
```

## CSS Extraction

Works the same way as you'd configure it for normal CSS. Example usage with [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin):

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
        // or `ExtractTextWebpackPlugin.extract(...)`
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

In SSR, we typically use `webpack-node-externals` to exclude npm dependencies from the server build. If you need to import CSS from an npm dependency, the previous solution was using a whitelist like this:

``` js
// webpack config
externals: nodeExternals({
  whitelist: /\.css$/
})
```

With v15, imports for `<style src="dep/foo.css">` now has `resourceQuery` strings appended at the end of the request, so you need to update the above to:

``` js
externals: nodeExternals({
  whitelist: [/\.css$/, /\?vue&type=style/]
})
```

## Options Deprecation

The following options have been deprecated and should be configured using normal webpack module rules:

- `loader`
- `preLoaders`
- `postLoaders`
- `postcss`
- `cssSourceMap`
- `buble`
- `extractCSS`
- `template`

The following options have been deprecated and should be configured using the new `compilerOptions` option:

- `preserveWhitespace` (use `compilerOptions.preserveWhitespace`)
- `compilerModules` (use `compilerOptions.modules`)
- `compilerDirectives` (use `compilerOptions.directives`)

The following option has been renamed:

- `transformToRequire` (now renamed to `transformAssetUrls`)

:::tip
For a complete list of new options, see [Options Reference](./options.md).
:::
