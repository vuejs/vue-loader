# 고급 로더 설정

Sometimes you may want to:

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
          },
          
          // `excludedPreLoaders` should be regex
          excludedPreLoaders: /(eslint-loader)/
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
고급 로더 설정을 보다 실용적으로 사용하면 [컴포넌트 내부의 CSS를 단일 파일로 추출할 수 있습니다](./extract-css.md).
