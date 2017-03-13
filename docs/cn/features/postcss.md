# PostCSS

Any CSS output processed by `vue-loader` is piped through [PostCSS](https://github.com/postcss/postcss) for scoped CSS rewriting. You can also add custom PostCSS plugins to the process, for example [autoprefixer](https://github.com/postcss/autoprefixer) or [CSSNext](http://cssnext.io/).

## Using a Config File

Starting in 11.0 `vue-loader` supports auto-loading the same PostCss config files supported by [`postcss-loader`](https://github.com/postcss/postcss-loader#usage):

- `postcss.config.js`
- `.postcssrc`
- `postcss` field in `package.json`

Using a config file allows you to share the same config between your normal CSS files processed by `postcss-loader` and the CSS inside `*.vue` files, and is recommended.

## Inline Options

Alternatively, you can specify postcss config specifically for `*.vue` files using the `postcss` option for `vue-loader`.

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
  // other options...
  module: {
    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // vue-loader options goes here
        options: {
          // ...
          postcss: [require('postcss-cssnext')()]
        }
      }
    ]
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
