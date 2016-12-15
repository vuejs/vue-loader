# 고급 로더 설정

때로는 `vue-loader`가 그것을 추론하는 대신 언어에 커스텀 로더 스트링을 적용하기를 원할 수도 있습니다. 또는 디폴트 언어에서 기본적으로 제공되는 로더 설정을 덮어쓰고 싶을 수도 있습니다. 이를 위해서 Webpack 설정 파일에 `vue` 블럭을 추가하고 `loaders` 옵션을 지정하세요.

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

### Webpack 2.x (^2.1.0-beta.25)

``` js
module.exports = {
  // other options...
  module: {
    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        // vue-loader options goes here
        options: {
          loaders: {
            // ...
          }
        }
      }
    ]
  }
}
```

고급 로더 설정을 보다 실용적으로 사용하면 [컴포넌트 내부의 CSS를 단일 파일로 추출할 수 있습니다](./extract-css.md).