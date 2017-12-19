# PostCSS

Any CSS output processed by `vue-loader` is piped through [PostCSS](https://github.com/postcss/postcss) for scoped CSS rewriting. You can also add custom PostCSS plugins to the process, for example [autoprefixer](https://github.com/postcss/autoprefixer) or [CSSNext](http://cssnext.io/).

## Using a Config File

`vue-loader` supports auto-loading the same PostCss config files supported by [`postcss-loader`](https://github.com/postcss/postcss-loader#usage):

- `postcss.config.js`
- `.postcssrc`
- `postcss` field in `package.json`

Using a config file allows you to share the same config between your normal CSS files processed by `postcss-loader` and the CSS inside `*.vue` files, and is recommended.

## Using with `postcss-loader`

Since `vue-loader` handles PostCSS on its styles internally, you only need to apply `postcss-loader` to standalone CSS files. There's no need to specify `lang="postcss"` on a style block if there is a PostCSS config file in your project.

Sometimes the user may want to use `lang="postcss"` only for syntax highlighting purposes. Starting in 13.6.0, if no loader has been explicitly configured for the following common PostCSS extensions (via `vue-loader`'s own `loaders` option), they will simply go through `vue-loader`'s default PostCSS transforms:

- `postcss`
- `pcss`
- `sugarss`
- `sss`

## Inline Options

Alternatively, you can specify PostCSS config specifically for `*.vue` files using the `postcss` option for `vue-loader`.

Example usage in webpack 1.x:

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // use custom PostCSS plugins
    postcss: [require('postcss-cssnext')()]
  }
}
```

For webpack 2.x:

``` js
// webpack.config.js
module.exports = {
  // other options...
  module: {
    // `module.rules` is the same as `module.loaders` in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // `vue-loader` options goes here
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
      parser: 'sugarss' // use sugarss parser
    }
  }
  ```

### Disabling Auto Config File Loading

In `13.6.0+`, auto PostCSS config file loading can be disabled by specifying `postcss.useConfigFile: false`:

``` js
postcss: {
  useConfigFile: false,
  plugins: [/* ... */],
  options: {/* ... */}
}
```

This allows the PostCSS configuration inside `*.vue` files to be entirely controlled by the inline config.
