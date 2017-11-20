# 전처리기 사용하기

webpack에서는 모든 전처리기가 해당 로더와 함께 적용되어야 합니다. `vue-loader`는 다른 webpack 로더를 사용하여 Vue 컴포넌트의 일부를 처리 할 수 있게 합니다. 언어 블럭의 `lang` 속성에서 사용할 적절한 로더를 자동으로 알아챕니다.

### CSS

예를 들어, SASS로 `<style>`을 컴파일해봅시다.

``` bash
npm install sass-loader node-sass --save-dev
```

``` html
<style lang="sass">
  /* sass로 작성하세요 */
</style>
```

내부적으로, `<style>` 태그 안의 텍스트 내용은 후처리를 위해서 전달되기 전에 `sass-loader`에 의해 먼저 컴파일됩니다.

### JavaScript

Vue 컴포넌트 내의 모든 JavaScript는 기본적으로 `babel-loader`에 의해서 처리됩니다. 물론 변경할 수 있습니다.

``` bash
npm install coffee-loader --save-dev
```

``` html
<script lang="coffee">
  # coffeescript로 작성하세요!
</script>
```

### 템플릿

`pug-loader`와 같은 대부분의 webpack 템플릿 로더는 컴파일된 HTML 문자열 대신 템플릿 함수를 반환하기 때문에 템플릿 처리는 앞서 처리한 방법과 약간 다릅니다. `pug-loader` 대신 원래의 `pug` 파일을 설치하여 사용할 수 있습니다.

``` bash
npm install pug --save-dev
```

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

> **중요:** 만약 `vue-loader@<8.2.0`을 사용한다면, `template-html-loader`도 설치해야 합니다.

### 인라인 로더 요청

당신은 `lang` 속성에서 [webpack 로더 요청](https://webpack.github.io/docs/loaders.html#introduction)을 할 수 있습니다.

``` html
<style lang="sass?outputStyle=expanded">
  /* sass로 작성하세요 */
</style>
```

그러나 이것은 Vue 컴포넌트가 webpack에 한정되어 있고 Browserify 및 [vueify](https://github.com/vuejs/vueify)와 호환되지 않습니다. **Vue 컴포넌트를 재사용 가능한 써드파티로 제공하려면 이 구문을 사용하지 마십시오.**
