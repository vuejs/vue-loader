# PostCSS

Any CSS output processed by `vue-loader` is piped through [PostCSS](https://github.com/postcss/postcss) for scoped CSS rewriting. You can also add custom PostCSS plugins to the process, for example [autoprefixer](https://github.com/postcss/autoprefixer) or [CSSNext](http://cssnext.io/).

Example usage in Webpack 1.x:

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // use custom postcss plugins
    postcss: [require('postcss-cssnext')()]
  }
}
```

For Webpack 2.x:

``` js
// webpack.config.js
module.exports = {
  // other configs...
  plugins: [
    new webpack.LoaderOptionsPlugin({
      vue: {
        // use custom postcss plugins
        postcss: [require('postcss-cssnext')()]
      }
    })
  ]
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
