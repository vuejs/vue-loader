# PostCSS and Autoprefixer

Any CSS output processed by `vue-loader` is piped through [PostCSS](https://github.com/postcss/postcss) for scoped CSS rewriting and auto-prefixed by default using [autoprefixer](https://github.com/postcss/autoprefixer).

### Configuring Autoprefixer

You can configure autoprefixer using the `autoprefixer` option under the `vue` section of your webpack config. See possible [autoprefixer options](https://github.com/postcss/autoprefixer#options). Also, you can pass in `false` to disable autoprefixing.

Example:

``` js
// webpack.config.js
module.exports = {
  // other options...
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  // vue-loader configurations
  vue: {
    // configure autoprefixer
    autoprefixer: {
      browsers: ['last 2 versions']
    }
  }
}
```

### Using Custom PostCSS Plugins

To use custom PostCSS plugins, pass an array to the `postcss` option under the `vue` section. Example using [CSSNext](http://cssnext.io/):

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // use custom postcss plugins
    postcss: [require('postcss-cssnext')()],
    // disable vue-loader autoprefixing.
    // this is a good idea since cssnext comes with it too.
    autoprefixer: false
  }
}
```

In addition to providing an Array of plugins, the `postcss` option also accepts:

- A function that returns an array of plugins;

- An object that contains options to be passed to the PostCSS processor. This is useful when you are using PostCSS projects that relies on custom parser/stringifiers:

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: sugarss // use sugarss parser
    }
  }
  ```
