# Advanced Loader Configuration

Sometimes the you may want to:

1. Apply a custom loader string to a language instead of letting `vue-loader` infer it;

2. Overwrite the built-in loader configuration for the default languages;

3. Pre-process or post-process a specific language block with custom loaders.

To do that, specify the `loaders` option for `vue-loader`:

> Note that `preLoaders` and `postLoaders` are only supported in >=10.3.0

### Webpack 2.x

``` js
module.exports = {
  // other options...
  module: {
    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `loaders` will overwrite the default loaders.
          // The following config will cause all <script> tags without "lang"
          // attribute to be loaded with coffee-loader
          loaders: {
            js: 'coffee-loader'
          },

          // `preLoaders` are attached before the default loaders.
          // You can use this to pre-process language blocks - a common use
          // case would be build-time i18n.
          preLoaders: {
            js: '/path/to/custom/loader'
          },

          // `postLoaders` are attached after the default loaders.
          //
          // - For `html`, the result returned by the default loader
          //   will be compiled JavaScript render function code.
          //
          // - For `css`, the result will be returned by vue-style-loader
          //   which isn't particularly useful in most cases. Using a postcss
          //   plugin will be a better option.
          postLoaders: {
            html: 'babel-loader'
          }
        }
      }
    ]
  }
}
```

### Webpack 1.x

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
    loaders: {
      // same configuration rules as above
    }
  }
}
```

A more practical usage of the advanced loader configuration is [extracting CSS inside components into a single file](./extract-css.md).
