# vue-loader [![Build Status](https://img.shields.io/circleci/project/vuejs/vue-loader.svg)](https://circleci.com/gh/vuejs/vue-loader) [![npm package](https://img.shields.io/npm/v/vue-loader.svg)](https://www.npmjs.com/package/vue-loader)

> Vue.js component loader for [Webpack](http://webpack.github.io), using Webpack loaders for the parts.

It allows you to write your components in this format:

``` html
// app.vue
<style>
  .red {
    color: #f00;
  }
</style>

<template>
  <h1 class="red">{{msg}}</h1>
</template>

<script>
  module.exports = {
    data: function () {
      return {
        msg: 'Hello world!'
      }
    }
  }
</script>
```

## Table of Contents


- [Basic Usage](#basic-usage)
- [Pre-Processors](#pre-processors)
- [Template Pre-Processors](#template-pre-processors)
- [Style Imports](#style-imports)
- [Asset URL Handling](#asset-url-handling)
- [Scoped Styles](#scoped-styles)
- [Hot Reload](#hot-reload)
- [Advanced Loader Configuration](#advanced-loader-configuration)
  - [ES6 with Babel Example](#example-using-es6-with-babel)
  - [Extract CSS Example](#example-extracting-css-into-a-single-file)
- [Example Project](https://github.com/vuejs/vue-loader-example)

## Basic Usage

Config Webpack:

``` js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'build.js'
  },
  module: {
    loaders: [
      { test: /\.vue$/, loader: 'vue' },
    ]
  }
}
```

And this is all you need to do in your main entry file:

``` js
// main.js
var Vue = require('vue')
var appOptions = require('./app.vue')
var app = new Vue(appOptions).$mount('#app')
```

## Pre-Processors

`vue-loader` allows you to use other Webpack loaders to pre-process the different parts inside your `*.vue` components. Just specify the loader to use with the `lang` attribute (you also need to install the loader, obviously):

``` html
<style lang="stylus">
  /* use stylus here */
</style>
```

You can also include Webpack loader queries in the `lang` attribute:

``` html
<style lang="sass?outputStyle=expanded">
  /* use sass here with expanded output */
</style>
```

## Template Pre-Processors

For template pre-processors, you should install `template-html-loader` plus the raw templating engine. For example to use `jade`, you will need to install both `template-html-loader` and `jade` instead of `jade-loader`.

## Style Imports

If you want, you can separate your styles into a separate file and import it using the `src` attribute:

``` html
<style src="./style.css"></style>
```

Beware that `src` imports follow similar rules to `require()` calls, which means for relative paths you need to start with `./`, and you can import resources from node modules: `<style src="todomvc-app-css/index.css">`.

## Asset URL Handling

By default, `vue-loader` automatically processes your style and template files with `css-loader` and `vue-html-loader` - this means that all asset URLs such as `<img src="...">`, `background: url(...)` and CSS `@import` are **resolved as module dependencies**.

For example, `url(image.png)` will be translated into `require('./image.png')`. Because `.png` is not JavaScript, you will need to configure Webpack to use [file-loader](https://github.com/webpack/file-loader) or [url-loader](https://github.com/webpack/url-loader) to handle them. This may feel cumbersome, but it gives you some very powerful benefits in managing your static assets this way:

1. `file-loader` allows you to customize where to copy and place the asset file (by specifying `publicPath` in your Webpack config), and how they should be named with version hashes.

2. `url-loader` allows you to conditionally load a file as a inline Data URL if they are smaller than a given threshold.

For more details, see the respective documentations for [vue-html-loader](https://github.com/vuejs/vue-html-loader) and [css-loader](https://github.com/webpack/css-loader).

## Scoped Styles

> Experimental

When a `<style>` tag has the `scoped` attribute, its CSS will apply to elements of the current component only. This is similar to the style encapsulation found in Shadow DOM, but doesn't require any polyfills. It is achieved by transforming the following:

``` html
<style scoped>
.example {
  color: red;
}
</style>
<template>
  <div class="example">hi</div>
</template>
```

Into the following:

``` html
<style>
.example[_v-1] {
  color: red;
}
</style>
<template>
  <div class="example" _v-1>hi</div>
</template>
```

#### Notes

1. You can include both scoped and non-scoped styles in the same component.

2. A child component's root node will be affected by both the parent's scoped CSS and the child's scoped CSS.

3. Partials are not affected by scoped styles.

## Hot Reload

> Experimental

When using `webpack-dev-server` in hot mode, `vue-loader` enables hot component reloading for Vue.js 1.0.0+. An example config:

``` js
// webpack.example.config.js
module.exports = {
  entry: './src/main.js',
  output: {
    publicPath: '/static/',
    filename: 'build.js'
  },
  module: {
    loaders: [
      { test: /\.vue$/, loader: 'vue' },
    ]
  },
  devtool: '#source-map'
}
```

In `index.html`, include the bundle:

``` html
<script src="/static/build.js"></script>
```

Then, run the dev server with:

``` bash
webpack-dev-server --inline --hot --config webpack.example.config.js
```

Finally, visit `http://localhost:8080/webpack-dev-server/` to see the app with hot reloading.

For a complete example with hot reloading in action, see [vue-hackernews](https://github.com/vuejs/vue-hackernews).

### Hot Reload Notes

- When a component is hot-reloaded, its current state is preserved. However, the component itself is destroyed and recreated, so all of its lifecycle hooks will be called accordingly. Make sure to properly teardown any side effects in your lifecycle hooks.

- Private state for child components of a hot-reloaded component is not guaranteed to be preserved across reloads.

- A root Vue instance or a manually mounted instance cannot be hot-reloaded. It will always force a full reload.

## Advanced Loader configuration

By default, `vue-loader` will try to use the loader with the same name as
the `lang` attribute, but you can configure which loader should be used.

#### Example: Using ES6 with Babel

To apply Babel transforms to all your JavaScript, use this Webpack config:

``` js
var vue = require('vue-loader')

module.exports = {
  // entry, output...
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: vue.withLoaders({
          // apply babel transform to all javascript
          // inside *.vue files.
          js: 'babel?optional[]=runtime'
        })
      }
    ]
  },
  devtool: 'source-map'
}
```

Some explanantions: 

1. Here `js` is the default language for `<script>` blocks.

2. The `?optional[]=runtime` query string passed to the loader. This instructs Babel to use helper functions from the `babel-runtime` NPM package instead of injecting the helpers into every single file. You'll want this most of the time.

#### Example: Extracting CSS into a Single File

To extract out the generated css into a separate file,
use this Webpack config:

``` js
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var vue = require("vue-loader");

module.exports = {
  // entry, output...
  module: {
    loaders: [
      {
        test: /\.vue$/, loader: vue.withLoaders({
          css: ExtractTextPlugin.extract("css"),
          stylus: ExtractTextPlugin.extract("css!stylus")
        })
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin("[name].css")
  ]
}
```

## Example Project

For a simple setup example, see [vue-loader-example](https://github.com/vuejs/vue-loader-example).

For an actual project with dev setup with hot reloading and production setup with minification, see [vue-hackernews](https://github.com/vuejs/vue-hackernews).
