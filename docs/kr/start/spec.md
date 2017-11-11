# Vue 컴포넌트 스펙

`*.vue` 파일은 HTML과 같은 문법을 사용하여 Vue 컴포넌트를 작성합니다. 각각의 `*.vue` 파일은 3가지 유형의 최상위 language block인 `<template>`, `<script>`와 `<style>`로 이루어집니다.

``` html
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>

<custom1>
  예: 컴포넌트에 대한 설명서
</custom1>
```

`vue-loader`는 파일을 파싱하고 각 language block을 추출하며 필요한 경우 다른 로더를 통해 파이프 처리한 후 마지막으로 Module.exports가 Vue.js 컴포넌트 엘리먼트 옵션 객체인 CommonJS 모듈로 다시 조합합니다.

`vue-loader`는 language block에 `lang` 속성을 지정하여 CSS 전처리기나 HTML에서 템플릿을 컴파일 하는 것과 같은 기본 언어가 아닌 것을 사용할 수 있게 합니다. 예를 들어 컴포넌트 스타일에 SASS를 사용할 수 있습니다.

``` html
<style lang="sass">
  /* write SASS! */
</style>
```

[Pre-Processors 사용방법](../configurations/pre-processors.md)을 확인하세요.

### Language Blocks

#### `<template>`

- 기본 언어 : `html`.

- 각 `*.vue` 파일은 한번에 최대 하나의 `<template>` 블록을 포함할 수 있습니다.

- 내용은 문자열로 추출되어 컴파일 된 Vue 컴포넌트의 `template` 옵션으로 사용합니다.

#### `<script>`

- 기본 언어 : `js` (ES2015는`babel-loader` 또는`bubble-loader`가 감지되면 자동으로 지원됩니다).

- 각 `*.vue` 파일은 한번에 최대 하나의 `<script>` 블록을 포함할 수 있습니다.

- 스크립트는 CommonJS와 같은 (webpack을 통해 번들된 일반적인 `.js` 모듈같은)환경 에서  실행됩니다. 다른 의존성을 `require()`할 수 있습니다. 또한 ES2015를 지원하여 `import`와 `export`를 사용할 수 있습니다.

- 스크립트는 Vue.js 컴포넌트 옵션 객체를 내보내야합니다. `Vue.extend()`에 의해 생성된 확장 생성자를 export하는 것도 지원되지만 평범한 객체를 추천합니다.

#### `<style>`

- 기본 언어 : `css`.

- 한개의 `*.vue`에서 여러개의 `<style>`태그를 지원합니다.

- `<style>`태그는 `scoped` 또는 `module` 속성을 가질 수 있습니다. ([Scoped CSS](../features/scoped-css.md)와 [CSS Modules](../features/css-modules.md)를 확인하세요) 현재 컴포넌트에 스타일을 캡슐화 하는데 도움을 줍니다. 캡슐화 모드는 다른 여러개의 `<style>` 태그를 동일한 컴포넌트에 사용할 수 있습니다.

- 기본적으로, 내용이 추출되어 `style-loader`를 사용해 실제로 `<style>` 태그로 문서의 `<head>`에 동적으로 삽입됩니다. [모든 컴포넌트의 모든 스타일이 하나의 CSS 파일로 추출되도록  webpack을 설정](../configurations/extract-css.md)할 수 있습니다.
-
### 사용자 정의 블록

> 10.2.0 이상에서 지원합니다.

사용자 정의 블록은 `<docs>` 블록과 같이 프로젝트에 한정되는 요구에 따라 추가적으로 사용할 수 있습니다. `vue-loader`는 태그 이름을 사용해 섹션의 내용에 적용할 webpack 로더를 찾습니다. 로더는 `vue-loader` 옵션의 `loaders` 섹션에 지정되어야 합니다.

[사용자 정의 블록](../configurations/custom-blocks.md)에서 자세히 다룹니다.

### Src Imports

`*.vue` 컴포넌트를 여러개로 나누고 싶으면 `src` 속성을 사용해 language block을 위한 외부 파일을 가져올 수 있습니다.

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

`src` import는 CommonJS의 `require()` 호출과 동일한 경로 규칙을 사용하므로 `./`로 시작하는 상대 경로를 이용해 NPM 패키지를 직접 가져올 수 있습니다.

``` html
<!-- "todomvc-app-css" npm package에서 파일을 가져옵니다. -->
<style src="todomvc-app-css/index.css">
```

`src`는 사용자 정의 블록에서도 사용 가능합니다.

``` html
<unit-test src="./unit-test.js">
</unit-test>
```

### 구문 강조

현재 구문강조는 [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), 와 [JetBrains 제품](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm, 등)을 지원합니다. 다른 편집기/IDE에 대한 기여를 원합니다! Vue 컴포넌트에서 프리 프로세서를 사용하지 않는 경우 `*.vue`파일을 HTML로 인식하여 사용할 수도 있습니다.


### 주석

각 블록안에서 사용하는 언어(HTML, CSS, JavaScript, Jade, etc)의 주석 문법을 사용해야합니다. 최상위 수준의 주석은 HTML 구문을 사용합니다. `<!-- comment contents here -->`
