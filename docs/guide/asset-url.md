# Asset URL Handling

When Vue Loader compiles the `<template>` blocks in SFCs, it also converts any encountered asset URLs into **webpack module requests**.

For example, the following template snippet

``` vue
<img src="../image.png">
```

will be compiled into:

``` js
createElement('img', {
  attrs: {
    src: require('../image.png') // this is now a module request
  }
})
```

By default the following tag/attribute combinations are transformed, and can be configured using the [transformAssetUrls](../options.md#transformasseturls) option.

``` js
{
  video: ['src', 'poster'],
  source: 'src',
  img: 'src',
  image: 'xlink:href'
}
```

In addition, if you have configured to use [css-loader](https://github.com/webpack-contrib/css-loader) for the `<style>` blocks, asset URLs in your CSS will also be processed in a similar fashion.

## Transform Rules

Asset URL transforms adhere to the following rules:

- If the URL is an absolute path (e.g. `/images/foo.png`), it will be preserved as-is.

- If the URL starts with `.`, it's interpreted as a relative module request and resolved based on the folder structure on your file system.

- If the URL starts with `~`, anything after it is interpreted as a module request. This means you can even reference assets inside node modules:

  ``` html
  <img src="~some-npm-package/foo.png">
  ```

- If the URL starts with `@`, it's also interpreted as a module request. This is useful if your webpack config has an alias for `@`, which by default points to `/src` in any project created by `vue-cli`.

## Related Loaders

Because extensions like `.png` are not JavaScript modules, you will need to configure webpack to use [file-loader](https://github.com/webpack/file-loader) or [url-loader](https://github.com/webpack/url-loader) to properly handle them. Projects created with Vue CLI has this pre-configured.

## Why

The benefits of asset URL transforms are:

1. `file-loader` allows you to designate where to copy and place the asset file, and how to name it using version hashes for better caching. Moreover, this also means **you can just place images next to your `*.vue` files and use relative paths based on the folder structure instead of worrying about deployment URLs**. With proper config, webpack will auto-rewrite the file paths into correct URLs in the bundled output.

2. `url-loader` allows you to conditionally inline a file as base-64 data URL if they are smaller than a given threshold. This can reduce the amount of HTTP requests for trivial files. If the file is larger than the threshold, it automatically falls back to `file-loader`.
