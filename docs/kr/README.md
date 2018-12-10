# 소개

:::tip 버전 노트
Vue Loader v15 이상을 위한 문서입니다. 만약 v14이하 버전의 Vue Loader을 업그레이드 하고 싶다면, [마이그레이션 가이드](./migrating.md)를 확인하십시오. 이전 버전을 사용하고 싶다면, [이곳](https://vue-loader-v14.vuejs.org/kr)으로 이동해 주십시오.
:::

## Vue Loader는 무엇인가요?

`vue-loader`는 [싱글 파일 컴포넌트 (SFCs)](./spec.md)라는 형식으로 Vue 컴포넌트를 작성하는 것을 허용하는 [webpack](https://webpack.js.org/)의 로더이다.

``` vue
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

다음은 `vue-loader`가 제공하는 여러가지 유용한 기능입니다.:

-각 Vue 컴포넌트마다 서로 다른 webpack 로더를 사용할 수 있습니다.(예를 들면 `<style>`에 Sass, `<template>`에 Pug)
- `.vue` 파일 안에 커스텀 로더 체인을 가질 수 있는 커스텀 블록을 허용합니다. 
- `<style>` 과 `<template>`에서 참조된 정적 Asset파일을 모듈 의존성으로 간주하고 webpack 로더로 처리합니다.;
- 각 컴포넌트로 범위가 지정된 CSS를 시뮬레이션할 수 있습니다.;
- 개발하는 동안에 상태를 유지하는 핫 리로딩을 지원합니다.

간단히 말해서, webpack과 `vue-loader`의 결합은 Vue.js 어플리케이션을 제작하기 위한 현대적이고 유연하며 매우 강력한 프론트엔드 작업환경을 제공합니다.
