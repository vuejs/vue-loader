# 소개

### `vue-loader`는 무엇인가요?

`vue-loader`는 다음과 같이 작성된 Vue 컴포넌트를 일반적인 자바스크립트 모듈로 변환할 수 있는 webpack에서 사용하는 로더입니다.

![screenshot](http://blog.evanyou.me/images/vue-component.png)

다음은 `vue-loader`가 제공하는 여러가지 유용한 기능입니다.

- 기본적으로 ES2015를 지원합니다.
- 각 Vue 컴포넌트 마다 서로 다른 webpack 로더를 사용할 수 있습니다. 예를들면 `<style>`에 SASS, `<template>`에 Jade로 각각 설정 가능합니다.
- `<style>`과 `<template>`에서 참조된 정적 Asset 파일을 모듈로 취급하고 webpack 로더로 처리합니다.
- 각 컴포넌트마다 지정된 CSS를 시뮬레이트 할 수 있습니다.
- 개발 중에 컴포넌트 핫 리로딩을 지원합니다.

한 마디로 webpack과 `vue-loader`의 결합은 Vue.js 어플리케이션을 제작하기위한 현대적이고 유연하며 매우 강력한 작업환경을 제공합니다.

### webpack이 무엇인가요?

이미 webpack에 익숙하다면 이 설명을 건너뛰어도 됩니다. 하지만 webpack을 처음 사용하는 사람들에게는 다음과 같은 간단한 소개를 읽어보세요.

[webpack](http://webpack.github.io/)은 모듈의 묶음입니다. 각 파일을 모듈로 간주하고 파일 간의 종속성을 파악한 다음 정적 Asset으로 묶어서 배포합니다.

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

간단한 예를 들어보자면, 우리가 많은 CommonJS 모듈을 가지고 있다고 가정해봅시다. 모듈들은 브라우저 내부에서 바로 실행될 수 없으므로 `<script>` 태그를 통해 불러올 수 있도록 하나의 파일로 "묶어"야 합니다. webpack은 `require()` 호출을 통해 의존하는 각 파일을 하나로 묶을 수 있습니다.

여기서 webpack은 묶는일 외에도 더 많은 일을 할 수 있습니다. "로더"들을 사용하면 최종 Bundle(묶음)을 출력하기 전에 원하는 방식으로 모든 유형의 파일을 변환할 수 있도록 webpack에 지시할 수 있습니다. 몇 가지 예를 봅시다.

- ES2015 또는 CoffeeScript, TypeScript 모듈을 ES5 CommonJS 모듈로 변환할 수 있습니다.
- 선택 사항으로 컴파일 전에 linter를 이용하여 소스 코드를 연결 할 수 있습니다.
- Jade 템플릿을 일반 HTML로 변경하고 JavaScript 문자열로 반환합니다.
- SASS 파일을 일반 CSS로 변환한 다음 CSS를 `<style>` 태그로 삽입하는 JavaScript 스니펫으로 변환합니다.
- HTML 또는 CSS에서 참조된 이미지 파일을 처리하고 경로 구성에 따라 이동한 후 md5 해시를 사용하여 이름을 지정합니다.

webpack은 매우 강력하며 작동 원리를 이해한다면 프론트엔드 작업환경을 획기적으로 향상시킬 수 있습니다. 구성하기에 장황하고 복잡한 것이 단점입니다. 하지만 이 가이드를 사용하면 Vue.js 및 `vue-loader`에서 webpack을 사용할 때 가장 일반적인 문제에 대한 솔루션을 찾을 수 있습니다.
