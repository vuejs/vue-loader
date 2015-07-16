# vue-loader [![Build Status](https://img.shields.io/circleci/project/vuejs/vue-loader.svg)](https://circleci.com/gh/vuejs/vue-loader)

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

You can also mix preprocessor languages in the component file:

``` html
// app.vue
<style lang="stylus">
.red
  color #f00
</style>

<template lang="jade">
h1(class="red") {{msg}}
</template>

<script lang="coffee">
module.exports =
  data: ->
    msg: 'Hello world!'
</script>
```

And you can import using the `src` attribute:

``` html
<style lang="stylus" src="./style.styl"></style>
```

**NOTE**: Starting from version 2.1.0, `src` imports follow similar rules to `require()` calls, which means for relative paths you need to start with `./`, and you can import resources from node modules: `<style src="todomvc-app-css/index.css">`.

## Usage

Config Webpack:

``` js
// webpack.config.js
module.exports = {
  entry: "./main.js",
  output: {
    filename: "build.js"
  },
  module: {
    loaders: [
      { test: /\.vue$/, loader: "vue-loader" },
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

By default `vue-loader` needs `html-loader`, `css-loader` and `style-loader` as peer dependencies. In order to use pre-processors, you need to install the corresponding Webpack loader for that language.

**Note** For template pre-processors, use `template-html-loader` plus the raw templating engine. For example to use `jade`, you will need to install both `template-html-loader` and `jade` instead of `jade-loader`.

## Loader configuration

By default, `vue-loader` will try to use the loader with the same name as
the `lang` attribute, but you can configure which loader should be used.

For example, to extract out the generated css into a separate file,
use this configuration:

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var vue = require("vue-loader");

module.exports = {
  entry: "./main.js",
  output: {
    filename: "build.js"
  },
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
