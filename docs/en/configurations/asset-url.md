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

### Transform Rules

- If the URL is an absolute path (e.g. `/images/foo.png`), it will be preserved as-is.

- If the URL starts with `.`, it's interpreted as a relative module request and resolved based on the folder structure on your file system.

- If the URL starts with `~`, anything after it is interpreted as a module request. This means you can even reference assets inside node modules:

  ``` html
  <img src="~/some-npm-package/foo.png">
  ```

- (13.7.0+) If the URL starts with `@`, it's also interpreted as a module request. This is useful if your webpack config has an alias for `@`, which by default points to `/src` in any project created by `vue-cli`.

### Related Loaders

Because `.png` is not a JavaScript file, you will need to configure webpack to use [file-loader](https://github.com/webpack/file-loader) or [url-loader](https://github.com/webpack/url-loader) to handle them. The project scaffolded with `vue-cli` has also configured this for you.

### Why

The benefits of all this are:

1. `file-loader` allows you to designate where to copy and place the asset file, and how to name it using version hashes for better caching. Moreover, this also means **you can just place images next to your `*.vue` files and use relative paths based on the folder structure instead of worrying about deployment URLs**. With proper config, webpack will auto-rewrite the file paths into correct URLs in the bundled output.

2. `url-loader` allows you to conditionally inline a file as base-64 data URL if they are smaller than a given threshold. This can reduce the amount of HTTP requests for trivial files. If the file is larger than the threshold, it automatically falls back to `file-loader`.
