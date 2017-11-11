# PostCSS

`vue-loader`에 의해서 처리된 모든 CSS 출력은 범위가 지정된 CSS의 재 작성을 위해 [PostCSS](https://github.com/postcss/postcss)를 통해 파이프됩니다. 당신은 프로세스에 [autoprefixer](https://github.com/postcss/autoprefixer) 또는 [CSSNext](http://cssnext.io/)와 같은 사용자 정의 PostCSS 플러그인을 추가할 수 있습니다.

## 설정 파일 사용하기

11.0버전 부터 `vue-loader`는 [`postcss-loader`](https://github.com/postcss/postcss-loader#usage)가 지원하는 동일한 PostCSS 파일을 자동으로 불러옵니다.

- `postcss.config.js`
- `.postcssrc`
- `package.json`의 `postcss` 필드

설정 파일을 사용하면 `postcss-loader`가 처리한 일반적인 CSS파일과 `*.vue` 파일의 CSS에 같은 설정을 공유할 수 있습니다.

## 인라인 옵션

또는 `vue-loader`에 `postcss` 옵션을 사용해 `*.vue`파일을 위해 postcss 설정을 지정할 수 있습니다.

webpack 1버전 예제:

``` js
// webpack.config.js
module.exports = {
  // 기타 설정...
  vue: {
    // 사용자 정의 postcss 플러그인 사용
    postcss: [require('postcss-cssnext')()]
  }
}
```

webpack 2버전 예제:

``` js
// webpack.config.js
module.exports = {
  // 기타 설정...
  module: {
    // module.rules는 1.x의 module.loaders와 동일
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // vue-loader 옵션은 여기에 지정합니다
        options: {
          // ...
          postcss: [require('postcss-cssnext')()]
        }
      }
    ]
  }
}
```

`postcss` 옵션은 플러그인 배열을 제공하는 것 이외에 아래의 내용을 허용합니다.

- 플러그인 배열을 반환하는 함수

- PostCSS 프로세서에 전달할 옵션을 포함하는 객체입니다. 이것은 사용자 정의 파서/stingifier에 의존하는 PostCSS 프로젝트를 사용할 때 유용합니다.

  ``` js
  postcss: {
    plugins: [...], // 플러그인 목록
    options: {
      parser: sugarss // sugarss 파서 사용
    }
  }
  ```
