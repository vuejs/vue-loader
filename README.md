# vue-loader

> [Webpack](http://webpack.github.io) loader for Vue.js components

This loader allows you to write your components in this format:

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

Under the hood, the loader will:

- extract the styles and insert them with the `insert-css` module.
- extract the template as text and add it to your exported options.

You can `require()` other stuff in the `<script>` as usual.

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
      { test: /\.vue$/, loader: "vue" },
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

For a complete setup, see [vuejs/vue-loader-example](https://github.com/vuejs/vue-loader-example).

## Todos

- Support preprocessors like `<style lang="stylus">`
- Tests
- Browserify transform (vueify?)