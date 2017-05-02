# PostCSS

`vue-loader`에 의해서 처리된 모든 CSS 출력은 범위가 지정된 CSS의 재 작성을 위해 [PostCSS](https://github.com/postcss/postcss)를 통해 파이프됩니다. 당신은 프로세스에 [autoprefixer](https://github.com/postcss/autoprefixer) 또는 [CSSNext](http://cssnext.io/)와 같은 사용자 정의 PostCSS 플러그인을 추가할 수 있습니다.

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