# Chaining with Other Loaders

> requires ^10.1.0 for Vue 2.x, ^8.6.0 for Vue 1.x

Sometimes you may want to pre-process the vue file before passing it to `vue-loader`. To do that, you can customize with the `loader` option.

below example use your custom loader:

### Webpack 1.x

``` js
// webpack.config.js
module.exports = {
  // other options...
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue!' + require.resolve('./path/to/custom-loader')
      }
    ]
  }
}
```

### Webpack 2.x (^2.1.0-beta.25)

``` js
module.exports = {
  // other options...
  module: {
    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader!' + require.resolve('./path/to/custom-loader')
      }
    ]
  }
}
```

In about webpack query parameters, see the [webpack 2.x docs](https://webpack.js.org/loaders/#via-require), or [webpack 1.x docs](https://webpack.github.io/docs/using-loaders.html#query-parameters)
