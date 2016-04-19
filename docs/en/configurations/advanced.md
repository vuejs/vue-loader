# Advanced Loader Configuration

Sometimes you may want to apply a custom loader string to a language instead of letting `vue-loader` infer it. Or you may simply want to overwrite the built-in loader configuration for the default languages. To do that, add a `vue` block in your Webpack config file, and specify the `loaders` option.

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
    // ... other vue options
    loaders: {
      // load all <script> without "lang" attribute with coffee-loader
      js: 'coffee',
      // load <template> directly as HTML string, without piping it
      // through vue-html-loader first
      html: 'raw'
    }
  }
}
```

A more practical usage of the advanced loader configuration is [extracting CSS inside components into a single file](./extract-css.md).
