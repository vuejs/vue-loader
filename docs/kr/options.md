# 옵션 레퍼런스

## webpack 1 & 2 사용 방법의 차이점

webpack 2 : 직접 loader 규칙에 전달합니다

``` js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // vue-loader 옵션
        }
      }
    ]
  }
}
```

webpack 1.x의 경우 webpack 설정에 루트 `vue` 블럭을 추가합니다.

``` js
module.exports = {
  // ...
  vue: {
    // vue-loader 옵션
  }
}
```

### 로더

- 타입: `{ [lang: string]: string }`

  `*.vue` 파일의 언어 블럭에 사용할 webpack 로더를 지정하는 객체입니다. 이 키는 특별히 지정된 경우 language block에 대한 `lang` 속성에 해당합니다. 각 타입에 대한 기본적인 `lang`은 다음과 같습니다.

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  예를 들어, `babel-loader`와 `eslint-loader`를 사용하여 모든 `<script>` 블럭을 처리하려면 다음과 같이 사용합니다.

  ``` js
  // webpack 2.x config
module: {
  rules: [
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: {
          js: 'babel-loader!eslint-loader'
        }
      }
    }
  ]
}
```

### preLoaders

- 타입: `{ [lang: string]: string }`
- only supported in >=10.3.0
- 10.3.0 버전 이후 지원

  `loaders` 설정의 포맷과 동일하지만, `preLoaders`는 기본 로더보다 우선하여 language block에 적용됩니다. 이를 사용하면 language block을 미리 처리할 수 있습니다. (일반적인 사용 사례는 빌드 타임에 국제화를 적용하는 경우입니다.)

### postLoaders

- 타입: `{ [lang: string]: string }`
- 10.3.0 버전 이후 지원

`loaders` 설정의 포맷과 동일하지만, `preLoaders`는 기본 로더보다 나중에 적용됩니다. 이를 사용하면 language block에 대한 사후 처리를 할 수 있습니다. 약간 복잡합니다.

  - `html`의 경우, 기본 로더의 결과는 컴파일 된 JavaScript 렌더링 함수 코드가 됩니다.

  - `css`의 경우, 결과는 `vue-style-loader`가 반환하고 대부분의 경우 별로 사용할 일은 없습니다. postcss 플러그인을 사용하는 것이 더 좋습니다.


### postcss

> 참고: 11.0.0 이후 PostCSS 설정파일을 사용할 것을 권장합니다. [`postcss-loader` 사용법](https://github.com/postcss/postcss-loader#usage).

- 타입: `Array` 또는 `Function`, `Object`
- `Object` 타입은 오직 ^8.5.0에서 지원됩니다.

  `*.vue` 파일 안에 CSS에 적용할 PostCSS 플러그인을 지정합니다. 함수를 사용하는 경우 함수는 동일한 로더 컨텍스트를 사용하여 호출되며 플러그인의 배열을 반환해야 합니다.

  ``` js
  // ...
  vue: {
    // 주의: `loaders`에서 `postcss` 옵션을 중첩하면 안됩니다.
    postcss: [require('postcss-cssnext')()],
    loaders: {
      // ...
    }
  }
  ```

  이 옵션은 PostCSS 프로세서에 전달할 옵션을 포함하는 객체일 수 있습니다. 이것은 사용자 정의 파서/문자열 변환기에 의존하는 PostCSS 프로젝트를 사용할 때 유용합니다.

  ``` js
  postcss: {
    plugins: [...], // 플러그인 리스트
    options: {
      parser: sugarss // sugarss parser를 사용합니다.
    }
  }
  ```

### cssSourceMap

- 타입: `Boolean`
- 디폴트: `true`

  CSS 소스 맵을 사용할지 여부를 정합니다. 이 기능을 끄면 `css-loader`에서 상대 경로와 관련된 버그를 피할 수 있고 빌드를 좀 더 빠르게 할 수 있습니다.

  `devtool` 옵션이 메인 webpack 설정에 없으면 자동으로 `false`로 설정됩니다.

### esModule

- 타입: `Boolean`
- 디폴트: `undefined`

  esModule 호환 코드를 사용할지 여부입니다. 기본적으로 vue-loader는 `module.exports = ....`와 같은 CommonJS 형식으로 내보냅니다. `esModule`이 true로 설정되면 내보내기는 `exports.__esModule = true; exports = ...`로 변환됩니다. TypeScript와 같은 Babel 이외의 변환툴과의 연동에 유용합니다.

### preserveWhitespace

- 타입: `Boolean`
- 디폴트: `true`

  만약 `false`로 설정하면 템플릿의 HTML 태그 사이의 공백이 무시됩니다.

### transformToRequire

- 타입: `{ [tag: string]: string | Array<string> }`
- 디폴트: `{ img: 'src', image: 'xlink:href' }`


  템플릿 컴파일 중에 컴파일러는 `src` URL과 같은 특정 속성을 `require` 호출로 변환하여 대상 Asset을 webpack에서 처리할 수 있습니다. 기본 설정은 `<img>` 태그에 `src` 속성을 변환합니다.

### buble

- 타입: `Object`
- 디폴트: `{}`

  `buble-loader`가 존재한다면 `buble-loader`에 대한 옵션을 설정하고, 템플릿 렌더링 함수를 위한 buble 컴파일 패스를 설정하세요.

  > 버전 노트: 버전 9.x에서 템플릿 표현식은 이제 제거된 `templateBuble` 옵션을 통해 별도로 설정됩니다.

  템플릿 렌더링 함수 컴파일은 특수 변환 `stripWith`(기본적으로 활성화됨)을 지원합니다. 이 함수는 생성된 렌더링 함수에서 `with` 사용을 제거하여 strict 모드를 준수합니다.

  다음은 설정 예 입니다.

  ``` js
  // webpack 1
  vue: {
    buble: {
      // object spread 연산자 사용
      // 참고: Object.assign 에 관한 폴리필을 직접 해야합니다!
      objectAssign: 'Object.assign',

      // `with` 제거를 끕니다.
      transforms: {
        stripWith: false
      }
    }
  }

  // webpack 2
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          buble: {
            // same options
          }
        }
      }
    ]
  }
  ```

### extractCSS

> 12.0.0에서 추가되었습니다

`extract-text-webpack-plugin`를 사용해 자동으로 CSS를 추출합니다. 대부분의 프리 프로세서를 사용할 수 있으며 프로덕션 모드에서 최소화를 합니다.

전달된 값은 `true`이거나 플러그인의 인스턴스일 수 있습니다. (추출된 여러 파일에 플러그인의 인스턴스를 사용할 수 있습니다)

프로덕션 환경에서만 사용되고, 개발 중에는 핫 리로드가 작동합니다.

예제:

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // other options...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: true
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

또는 플러그인 인스턴스를 전달합니다.

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var plugin = new ExtractTextPlugin("style.css")

module.exports = {
  // other options...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: plugin
        }
      }
    ]
  },
  plugins: [
    plugin
  ]
}
```
