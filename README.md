# vue-loader [![Build Status](https://circleci.com/gh/vuejs/vue-loader/tree/master.svg?style=shield)](https://circleci.com/gh/vuejs/vue-loader/tree/master) [![npm package](https://badge.fury.io/js/vue-loader.svg)](https://www.npmjs.com/package/vue-loader)

> Vue.js component loader for [Webpack](http://webpack.github.io), using Webpack loaders for the parts.

It allows you to write your components in this format:

``` html
// app.vue
<template>
  <h1 class="red">{{msg}}</h1>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.red {
  color: #f00;
}
</style>
```

## Table of Contents


- [Basic Usage](#basic-usage)
- [ES2015 by Default](#es2015-by-default)
- [CSS Pre-Processors](#css-pre-processors)
- [PostCSS](#postcss)
- [Template Pre-Processors](#template-pre-processors)
- [Src Imports](#src-imports)
- [Asset URL Handling](#asset-url-handling)
- [Scoped CSS](#scoped-css)
- [Hot Reload](#hot-reload)
- [Advanced Loader Configuration](#advanced-loader-configuration)
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
var App = require('./app.vue')

new Vue({
  el: 'body',
  components: {
    app: App
  }
})
```

In your HTML:

``` html
<body>
  <app></app>
  <script src="build.js"></script>
</body>
```

## ES2015 by Default

`vue-loader` automatically applies Babel transforms to the JavaScript inside `*.vue` components. Write ES2015 today!

**Compatibility Note:** vue-loader 7.0+ uses Babel 6. If you need to use Babel 5 for transpiling your code, use vue-loader 6.x.

The default Babel options used for Vue.js components are:

``` js
{
  presets: ['es2015'],
  plugins: ['transform-runtime']
}
```

If you wish to override this, you can add a `babel` field in your webpack config, which will be applied to all JavaScript processed by `babel-loader`. For example:

``` js
// webpack.config.js
module.exports = {
  // other configs...
  babel: {
    // enable stage 0 transforms.
    // make sure to install babel-presets-stage-0
    presets: ['es2015', 'stage-0'],
    plugins: ['transform-runtime']
  }
}
```

## CSS Pre-Processors

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

## PostCSS

Any CSS output via `vue-loader` 6.0+ is piped through [PostCSS](https://github.com/postcss/postcss) for [scoped CSS](#scoped-css) rewriting and aut-prefixed by default using [autoprefixer](https://github.com/postcss/autoprefixer). You can configure autoprefixer or provide your own PostCSS plugins in the `vue` section of your webpack config:

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // configure autoprefixer
    autoprefixer: {
      browsers: ['last 2 versions']
    }
  }
}
```

Using other PostCSS plugins:

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // use custom postcss plugins
    postcss: [require('cssnext')()],
    // disable vue-loader autoprefixing.
    // this is a good idea since cssnext comes with it too.
    autoprefixer: false
  }
}
```

## Template Pre-Processors

For template pre-processors, you should install `template-html-loader` plus the raw templating engine. For example to use `jade`, you will need to install both `template-html-loader` and `jade` instead of `jade-loader`.

## Src Imports

If you want, you can separate your template and styles into separate files and import them using the `src` attribute:

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
```

Beware that `src` imports follow similar rules to `require()` calls, which means for relative paths you need to start with `./`, and you can import resources from installed NPM packages, e.g. `<style src="todomvc-app-css/index.css">`.

## Asset URL Handling

By default, `vue-loader` automatically processes your style and template files with `css-loader` and `vue-html-loader` - this means that all asset URLs such as `<img src="...">`, `background: url(...)` and CSS `@import` are **resolved as module dependencies**.

For example, `url(image.png)` will be translated into `require('./image.png')`. Because `.png` is not JavaScript, you will need to configure Webpack to use [file-loader](https://github.com/webpack/file-loader) or [url-loader](https://github.com/webpack/url-loader) to handle them. This may feel cumbersome, but it gives you some very powerful benefits in managing your static assets this way:

1. `file-loader` allows you to customize where to copy and place the asset file (by specifying `publicPath` in your Webpack config), and how they should be named with version hashes.

2. `url-loader` allows you to conditionally load a file as a inline Data URL if they are smaller than a given threshold.

For more details, see the respective documentations for [vue-html-loader](https://github.com/vuejs/vue-html-loader) and [css-loader](https://github.com/webpack/css-loader).

## Scoped CSS

> Experimental

When a `<style>` tag has the `scoped` attribute, its CSS will apply to elements of the current component only. This is similar to the style encapsulation found in Shadow DOM, but doesn't require any polyfills. It is achieved by using PostCSS to transform the following:

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
.example[_v-f3f3eg9] {
  color: red;
}
</style>
<template>
  <div class="example" _v-f3f3eg9>hi</div>
</template>
```

#### Notes

1. You can include both scoped and non-scoped styles in the same component.

2. A child component's root node will be affected by both the parent's scoped CSS and the child's scoped CSS.

3. If you are nesting a component inside itself, the styles may still leak down since they are considered the same component.

4. Partials are not affected by scoped styles.

## Hot Reload

> Experimental

When using `webpack-dev-server` in hot mode, `vue-loader` enables hot component reloading for Vue.js 1.0.0+. An example config:

``` js
// webpack.config.js
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
<script src="static/build.js"></script>
```

Then, run the dev server with:

``` bash
webpack-dev-server --inline --hot
```

Finally, visit `http://localhost:8080/` to see the app with hot reloading.

For a complete example with hot reloading in action, see [vue-hackernews](https://github.com/vuejs/vue-hackernews).

### Hot Reload Notes

- When a component is hot-reloaded, its current state is preserved. However, the component itself is destroyed and recreated, so all of its lifecycle hooks will be called accordingly. Make sure to properly teardown any side effects in your lifecycle hooks.

- Private state for child components of a hot-reloaded component is not guaranteed to be preserved across reloads.

- A root Vue instance or a manually mounted instance cannot be hot-reloaded. It will always force a full reload.

## Advanced Loader configuration

By default, `vue-loader` will try to use the loader with the same name as
the `lang` attribute, but you can configure which loader should be used.

#### Example: Use CoffeeScript for all `<script>` tags

``` js
module.exports = {
  // entry, output...
  module: {
    loaders: [{
      test: /\.vue$/, loader: 'vue'
    }]
  },
  vue: {
    loaders: {
      js: 'coffee'
    }
  },
  devtool: '#source-map'
}
```

#### Example: Extracting CSS into a Single File

To extract out the generated css into a separate file,
use this Webpack config:

``` js
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  // entry, output...
  module: {
    loaders: [
      {
        test: /\.vue$/, loader: 'vue'
      },
    ]
  },
  vue: {
    loaders: {
      css: ExtractTextPlugin.extract("css"),
      stylus: ExtractTextPlugin.extract("css!stylus")
    }
  },
  plugins: [
    new ExtractTextPlugin("[name].css")
  ]
}
```

## Example Project

For a simple setup example, see [vue-loader-example](https://github.com/vuejs/vue-loader-example).

For an actual project with dev setup with hot reloading and production setup with minification, see [vue-hackernews](https://github.com/vuejs/vue-hackernews).
