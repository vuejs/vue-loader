# Asset URL Handling

By default, `vue-loader` automatically processes your style and template files with [css-loader](https://github.com/webpack/css-loader) and the Vue template compiler. In this compilation process, all asset URLs such as `<img src="...">`, `background: url(...)` and CSS `@import` are **resolved as module dependencies**.

For example, `url(./image.png)` will be translated into `require('./image.png')`, and

``` html
<img src="../image.png">
```

will be compiled into:

``` js
createElement('img', { attrs: { src: require('../image.png') }})
```

Because `.png` is not a JavaScript file, you will need to configure Webpack to use [file-loader](https://github.com/webpack/file-loader) or [url-loader](https://github.com/webpack/url-loader) to handle them. The project scaffolded with `vue-cli` has also configured this for you.

The benefits of all this are:

1. `file-loader` allows you to designate where to copy and place the asset file, and how to name it using version hashes for better caching. Moreover, this also means **you can just place images next to your `*.vue` files and use relative paths based on the folder structure instead of worrying about deployment URLs**. With proper config, Webpack will auto-rewrite the file paths into correct URLs in the bundled output.

2. `url-loader` allows you to conditionally inline a file as base-64 data URL if they are smaller than a given threshold. This can reduce the amount of HTTP requests for trivial files. If the file is larger than the threshold, it automatically falls back to `file-loader`.
