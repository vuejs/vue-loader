# Getting Started

## Vue CLI

If you are not interested in manually setting up webpack, it is recommended to scaffold a project with [Vue CLI](https://github.com/vuejs/vue-cli) instead. Projects created by Vue CLI are pre-configured with most of the common development needs working out of the box.

Follow this guide if the built-in configuration of Vue CLI does not suit your needs, or you'd rather create your own webpack config from scratch.

## Manual Configuration

Vue Loader's configuration is a bit different form other loaders. In addition to a rule that applies `vue-loader` to any files with extension `.vue`, make sure to add Vue Loader's plugin to your webpack config:

``` js
// webpack.config.js
const VueLoaderPlugin = require('vue-loader/lib/plugin')

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
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

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
