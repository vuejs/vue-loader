# 고급 로더 설정

아래와 같은 요구사항이 있을 수 있습니다.

1. `vue-loader`가 추측하는 대신 언어에 맞는 사용자 정의 로더를 사용해야합니다.

2. 기본 언어에 대한 로더를 덮어써야합니다.

3. 특정 language block을 위한 사용자 정의 프리 또는 포스트 프로세스를 해야합니다.

이를 위해 `vue-loader`에 `loaders` 옵션을 지정해야합니다.

> 참고: `preLoaders`와 `postLoaders`는 10.3.0 버전 이상에서만 지원합니다.

### webpack 2.x

``` js
module.exports = {
  // 기타 옵션들...
  module: {
    // module.rules은 1.x버전의 module.loaders과 같습니다
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `loaders`는 기본 로더를 덮어씁니다.
          // 다음 설정은 "lang" 속성이 없는
          // 모든 <script> 태그가 coffee 로더와 함께 로드되도록 합니다
          loaders: {
            js: 'coffee-loader'
          },

          // `preLoaders`는 기본 로더 앞에 붙습니다.
          // 이를 이용해 language block을 프리 프로세스할 수 있습니다.
          // 일반적으로 빌드타임에 다국어 처리를 할 수 있습니다.
          preLoaders: {
            js: '/path/to/custom/loader'
          },

          // `postLoaders`는 기본 로더 뒤에 붙습니다.
          // - `html`의 경우, 기본 로더의 결과는 컴파일 된 JavaScript 렌더링 함수 코드가 됩니다.

          //  - `css`의 경우, 결과는 `vue-style-loader`가 반환하고
          // 대부분의 경우 별로 사용할 일은 없습니다. postcss 플러그인을 사용하는 것이 더 좋습니다.
          postLoaders: {
            html: 'babel-loader'
          },

          // `excludedPreLoaders`는 반드시 정규표현식을 사용합니다
          excludedPreLoaders: /(eslint-loader)/
        }
      }
    ]
  }
}
```

### webpack 1.x

``` js
// webpack.config.js
module.exports = {
  // 기타 옵션들...
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
    loaders: {
      // 위와 동일한 설정 규칙입니다
    }
  }
}
```
고급 로더 설정을 보다 실용적으로 사용하면 [컴포넌트 내부의 CSS를 단일 파일로 추출할 수 있습니다](./extract-css.md).
