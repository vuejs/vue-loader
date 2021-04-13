# Getting Started

## Vue CLI

If you are not interested in manually setting up webpack, it is recommended to scaffold a project with [Vue CLI](https://github.com/vuejs/vue-cli) instead. Projects created by Vue CLI are pre-configured with most of the common development needs working out of the box.

Follow this guide if the built-in configuration of Vue CLI does not suit your needs, or you'd rather create your own webpack config from scratch.

## Manual Setup

### Installation

Unless you are an advanced user using your own forked version of Vue's template compiler, you should install `vue-loader` and `vue-template-compiler` together:

``` bash
npm install -D vue-loader vue-template-compiler
```

The reason `vue-template-compiler` has to be installed separately is so that you can individually specify its version.

Every time a new version of `vue` is released, a corresponding version of `vue-template-compiler` is released together. The compiler's version must be in sync with the base `vue` package so that `vue-loader` produces code that is compatible with the runtime. This means **every time you upgrade `vue` in your project, you should upgrade `vue-template-compiler` to match it as well.**

### webpack Configuration

Vue Loader's configuration is a bit different from other loaders. In addition to a rule that applies `vue-loader` to any files with extension `.vue`, make sure to add Vue Loader's plugin to your webpack config:

``` js
// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  module: {
    rules: [
      // ... other rules
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    // make sure to include the plugin!
    new VueLoaderPlugin()
  ]
}
```

**The plugin is required!** It is responsible for cloning any other rules you have defined and applying them to the corresponding language blocks in `.vue` files. For example, if you have a rule matching `/\.js$/`, it will be applied to `<script>` blocks in `.vue` files.

A more complete example webpack config will look like this:

``` js
// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // this will apply to both plain `.js` files
      // AND `<script>` blocks in `.vue` files
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      // this will apply to both plain `.css` files
      // AND `<style>` blocks in `.vue` files
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin()
  ]
}
```

Also see [Options Reference](../options.md) for all available loader options.

::: warning
If you are developing a library or in a monorepo, please be aware that CSS imports **are side effects**. Make sure to **remove** `"sideEffects": false` in the `package.json`, otherwise CSS chunks will be dropped by webpack in production builds.
:::
