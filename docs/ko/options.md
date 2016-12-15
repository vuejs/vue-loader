# 옵션 레퍼런스

## Webpack 1 & 2 사용 방법의 차이점

Webpack 1.x의 경우 Webpack 설정에 루트 `vue` 블럭을 추가합니다.

``` js
module.exports = {
  // ...
  vue: {
    // vue-loader options
  }
}
```

Webpack 2 (^2.1.0-beta.25)는 다음과 같습니다.

``` js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          // vue-loader options
        }
      }
    ]
  }
}
```

### loaders

- 타입: `Object`

  `*.vue` 파일의 language block에 사용할 Webpack 로더를 지정하는 객체입니다. 이 키는 특별히 지정된 경우 language block에 대한 `lang` 속성에 해당합니다. 각 타입에 대한 기본적인 `lang`은 다음과 같습니다.

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  예를 들어, `babel-loader`와 `eslint-loader`를 사용하여 모든 `<script>` 블럭을 처리하려면 다음과 같이 사용합니다.

  ``` js
  // ...
  vue: {
    loaders: {
      js: 'babel!eslint'
    }
  }
  ```

### postcss

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

  이 옵션은 PostCSS 프로세서에 전달할 옵션을 포함하는 객체일 수 있습니다. 이것은 사용자 정의 parser/stringifiers에 의존하는 PostCSS 프로젝트를 사용할 때 유용합니다.

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: sugarss // use sugarss parser
    }
  }
  ```

### cssSourceMap

- 타입: `Boolean`
- 디폴트: `true`

  CSS 소스 맵을 사용할지 여부를 정합니다. 이 기능을 끄면 `css-loader`에서 상대 경로와 관련된 버그를 피할 수 있고 빌드를 좀 더 빠르게 할 수 있습니다.

  `devtool` 옵션이 메인 Webpack 설정에 없으면 자동으로 `false`로 설정됩니다.

### esModule

- 타입: `Boolean`
- 디폴트: `undefined`

  Whether to emit esModule compatible code. By default vue-loader will emit default export in commonjs format like `module.exports = ....`. When `esModule` is set to true, default export will be transpiled into `exports.__esModule = true; exports = ...`. Useful for interoperating with transpiler other than Babel, like TypeScript.

### preserveWhitespace

- 타입: `Boolean`
- 디폴트: `true`

  만약 `false`로 설정하면 템플릿의 HTML 태그 사이의 공백이 무시됩니다.

### transformToRequire

- 타입: `{ [tag: string]: string | Array<string> }`
- 디폴트: `{ img: 'src' }`

  템플릿 컴파일 중에 컴파일러는 `src` URL과 같은 특정 속성을 `require` 호출로 변환하여 대상 Asset을 Webpack에서 처리할 수 있습니다. 기본 설정은 `<img>` 태그에 `src` 속성을 변환합니다.

### buble

- 타입: `Object`
- 디폴트: `{}`

  Configure options for `buble-loader` (if present), AND the buble compilation pass for template render functions.
  `buble-loader`가 존재한다면 `buble-loader`에 대한 옵션을 설정하고, 템플릿 렌더링 함수를 위한 buble 컴파일 패스를 설정하세요.

  > 버전 노트: 버전 9.x에서 템플릿 표현식은 이제 제거된 `templateBuble` 옵션을 통해 별도로 설정됩니다.

  템플릿 렌더링 함수 컴파일은 특수 변환 `stripWith`(기본적으로 활성화됨)을 지원합니다. 이 함수는 생성된 렌더링 함수에서 `with` 사용을 제거하여 strict 모드를 준수합니다.

  다음은 설정 예 입니다.

  ``` js
  // webpack 1
  vue: {
    buble: {
      // enable object spread operator
      // NOTE: you need to provide Object.assign polyfill yourself!
      objectAssign: 'Object.assign',

      // turn off the `with` removal
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
        loader: 'vue',
        options: {
          buble: {
            // same options
          }
        }
      }
    ]
  }
  ```
