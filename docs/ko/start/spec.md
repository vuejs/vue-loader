# Vue 컴포넌트 스펙

`*.vue` 파일은 HTML과 유사한 문법을 사용하여 Vue 컴포넌트를 작성하는 사용자 정의 파일입니다. 각 `*.vue` 파일은 `<template>`와 `<script>`, `<style>` 세 가지 유형의 최상위 language block으로 구성됩니다.

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
```

`vue-loader`는 파일을 파싱하고 각 language block을 추출한 다음 필요한 경우 다른 로더를 통해 파이프를 구성하고 `module.exports`가 Vue.js 옵션 객체인 CommonJS 모듈로 다시 합쳐줍니다.

`vue-loader`는 language block에 `lang` 속성을 지정하여 CSS 전처리기 혹은 HTML 컴파일 언어를 사용할 수 있습니다. 예를 들어, 다음과 같이 컴포넌트에 SASS를 사용할 수 있습니다.

``` html
<style lang="sass">
  /* SASS를 사용하세요! */
</style>
```

자세한 내용은 [전처리기 사용하기](../configurations/pre-processors.md)에서 확인할 수 있습니다.

### Language Block

#### `<template>`

- 기본 언어: `html`.

- 각 `*.vue` 파일은 하나의 `<template>` 블럭을 포함 할 수 있습니다.

- 내용은 문자열로 출력되어 컴파일된 Vue 컴포넌트의 `template` 옵션에 사용됩니다.

#### `<script>`

- 기본 언어: `js` (만약 `babel-loader` 또는 `buble-loader`를 사용한다면 ES2015를 자동으로 지원합니다).

- 각 `*.vue` 파일은 하나의 `<script>` 블럭을 포함 할 수 있습니다.

- 이 스크립트는 CommonJS와 같은 환경(Webpack을 통해 번들로 제공되는 `.js` 모듈처럼)에서 실행되기 때문에 다른 파일을 `require()` 할 수 있습니다. 또한 ES2015을 지원하면 `import`와 `export`를 사용할 수 있습니다.

- 스크립트는 Vue.js 컴포넌트 옵션 객체를 내보내야 합니다. `Vue.extend()`에 의해 생선된 확장 생성자를 내보내는 것도 가능하지만, 평범한 객체를 선호합니다.

#### `<style>`

- 기본 언어: `css`.

- 여러 개의 `<style>` 태그가 하나의 `*.vue` 파일에 포함될 수 있습니다.

- `<style>` 태그는 컴포넌트에 스타일을 캡슐화 할 수 있도록 `scoped` 또는 `module` 속성을 사용할 수 있습니다. ([범위 CSS](../features/scoped-css.md)와 [CSS 모듈](../features/css-modules.md)를 참고하세요)  여러 개의 `<style>` 태그로 동일한 컴포넌트에 캡슐화 모드를 혼합하여 사용 할 수 있습니다.

- 기본적으로 내용은 추출되고 `style-loader`를 사용하여 문서의 `<head>`에서 `<style>`태그로 동적으로 삽입됩니다. 또한 모든 [컴포넌트의 스타일이 단일 CSS 파일로 추출되도록](../configurations/extract-css.md) Webpack을 구성할 수 있습니다. 

### Src로 가져오기

`*.vue` 컴포넌트를 여러 파일로 분할하려 할 경우 `src` 속성을 사용하여 language block에 대한 외부 파일을 가져올 수 있습니다.

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

`src`로 가져오기가 CommonJS `require()` 호출과 동일한 경로 확인 규칙을 따르기 때문에 주의해야 합니다. 즉, `./`로 시작해야하는 상대 경로를 의미하며 설치된 NPM 패키지에서 직접 리소스를 가져올 수 있습니다.

``` html
<!-- 설치된 NPM 패키지 "todomvc-app-css"에서 파일을 불러옵니다 -->
<style src="todomvc-app-css/index.css">
```

### Syntax Highlighting

현재 [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), [JetBrains 제품](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm 등)에 Syntax Highlighting 기능이 있습니다. 다른 에디터/IDE에 대한 컨트리뷰션은 매우 환영합니다! 만약 에디터/IDE에서 Syntax Highlighting을 지원하지 않고, Vue 컴포넌트에서 전처리기를 사용하지 않는 경우 에디터에서 `*.vue` 파일을 HTML 형태로 보는 것을 추천합니다.

### 주석

각 블럭 안에는 사용되는 언어의 주석 처리 방법을 사용해야 합니다. 최상위 수준의 주석은 HTML 주석 처리 방법을 사용해주세요. `<!-- 주석 내용을 여기에 적어주세요 -->`