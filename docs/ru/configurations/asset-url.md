# Asset URL Handling

По умолчанию `vue-loader` автоматически обрабатывает стили и файлы шаблонов с помощью [css-loader](https://github.com/webpack/css-loader) и компилятора шаблонов Vue. In this compilation process, all asset URLs such as `<img src="...">`, `background: url(...)` and CSS `@import` are **resolved as module dependencies**.

Например, `url(./image.png)` будет преобразовано в `require('./image.png')`, а затем

``` html
<img src="../image.png">
```

будет скомпилировано в:

``` js
createElement('img', { attrs: { src: require('../image.png') }})
```

Так как `.png` это не JavaScript-файл, вам необходимо настроить Webpack использовать [file-loader](https://github.com/webpack/file-loader) или [url-loader](https://github.com/webpack/url-loader) для их обработки. Проект создаваемый с помощью `vue-cli` уже сделает это за вас.

The benefits of all this are:

1. `file-loader` allows you to designate where to copy and place the asset file, and how to name it using version hashes for better caching. Moreoever, this also means **you can just place images next to your `*.vue` files and use relative paths based on the folder structure instead of worrying about deployment URLs**. With proper config, Webpack will auto-rewrite the file paths into correct URLs in the bundled output.

2. `url-loader` allows you to conditionally inline a file as base-64 data URL if they are smaller than a given threshold. This can reduce the amount of HTTP requests for trivial files. If the file is larger than the threshold, it automatically falls back to `file-loader`.
