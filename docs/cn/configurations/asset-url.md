# Asset URL Handling

By default, `vue-loader` automatically processes your style and template files with [css-loader](https://github.com/webpack/css-loader) and [vue-html-loader](https://github.com/vuejs/vue-html-loader) (which is just a Vue-specific fork of [html-loader](https://github.com/webpack/html-loader)). What this means is that all asset URLs such as `<img src="...">`, `background: url(...)` and CSS `@import` are **resolved as module dependencies**.

For example, `url(image.png)` will be translated into `require('./image.png')`. Because `.png` is not JavaScript, you will need to configure Webpack to use [file-loader](https://github.com/webpack/file-loader) or [url-loader](https://github.com/webpack/url-loader) to handle them. This may feel cumbersome, but it gives us some very powerful benefits by managing static assets this way:

1. `file-loader` allows you to designate where to copy and place the asset file, and how to name it using version hashes. The best part though, is that you can use relative URLs based on the folder structure of your source files, and Webpack will auto-rewrite them into different URLs in the bundled files based on the configuration.

2. `url-loader` allows you to conditionally inline a file as base-64 data URL if they are smaller than a given threshold. This can reduce the amount of HTTP requests for trivial files. If the file is larger than the threshold, it automatically falls back to `file-loader`.

Here's an example Webpack config that handles `.png`, `jpg` and `.gif` files, and inlining any file smaller than 10kb as base64 data URL:

``` bash
npm install url-loader file-loader --save-dev
```

``` js
// webpack.config.js
module.exports = {
  // ... other options
  module: {
    loaders: [
      // ... other loaders
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url',
        query: {
          // limit for base64 inlining in bytes
          limit: 10000,
          // custom naming format if file is larger than
          // the threshold
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  }
}
```
