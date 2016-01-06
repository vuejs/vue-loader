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

To use custom PostCSS pugins, pass an array to the `postcss` option under the `vue` section. Example using [CSSNext](http://cssnext.io/):

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
