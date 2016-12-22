# 고급 로더 설정

때로는 `vue-loader`가 그것을 추론하는 대신 언어에 사용자 정의 로더 문자열을 적용하기를 원할 수도 있습니다. 또는 기본 언어에서 기본적으로 제공되는 로더 설정을 덮어쓰고 싶을 수도 있습니다. 이를 위해서 Webpack 설정 파일에 `vue` 블럭을 추가하고 `loaders` 옵션을 지정할 수 있습니다.

### Webpack 1.x

``` js
// webpack.config.js
module.exports = {
  // 이 부분엔 다른 옵션도 들어 갈 수 있습니다.
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  // vue-loader 설정
  vue: {
    // 이 부분엔 다른 Vue 옵션도 들어 갈 수 있습니다.
    loaders: {
      // coffee-loader에 "lang" 속성이 없는 모든 <script>를 로드하세요.
      js: 'coffee',
      // <template>을 HTML 문자열로 직접 로드하면
      // vue-html-loader를 통해 파이핑하지 않아도 됩니다.
      html: 'raw'
    }
  }
}
```

### Webpack 2.x (^2.1.0-beta.25)

``` js
module.exports = {
  // 이 부분엔 다른 옵션도 들어 갈 수 있습니다.
  module: {
    // module.rules는 1.x의 module.loaders와 동일합니다.
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        // vue-loader 옵션은 이곳에 옵니다.
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
