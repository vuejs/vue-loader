# 범위를 가지는 CSS

`<style>` 태그가 `scoped` 속성을 가지고있을 때, CSS는 현재 컴포넌트의 엘리먼트에만 적용됩니다. 이는 Shadow DOM에 있는 스타일 캡슐화와 유사합니다. 여기에는 몇 가지 주의사항이 있지만 폴리필은 필요 없습니다. PostCSS를 사용한다면 다음과 같이 변환할 수 있습니다.

``` html
<style scoped>
.example {
  color: red;
}
</style>

<template>
  <div class="example">안녕</div>
</template>
```

다음과 같이 변환됩니다.

``` html
<style>
.example[data-v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" data-v-f3f3eg9>안녕</div>
</template>
```

#### 참고사항

1. 범위가 지정된 스타일과 범위가 지정되지 않은 스타일은 동일한 컴포넌트에 포함 할 수 있습니다.

  ``` html
  <style>
  /* 전역 스타일 */
  </style>

  <style scoped>
  /* 로컬 스타일 */
  </style>
  ```

2. 하위 컴포넌트의 루트 노드는 상위 범위 CSS와 하위 범위 CSS의 영향을 받습니다.

3. Partial은 범위가 지정된 스타일의 영향을 받지 않습니다.

4. **범위가 지정된 스타일은 클래스의 필요성을 제거하는 것이 아닙니다**. 브라우저가 다양한 CSS 셀렉터를 렌더링하는 방식 때문에 `p { color: red }`는 범위(즉 속성 선택자와 결합될 때)가 지정될 때 몇 배는 더 느려집니다. `.example { color: red }`와 같이 클래스 또는 id를 대신 사용한다면 성능 이슈를 해결할 수 있습니다. [여기 플레이그라운드](http://stevesouders.com/efws/css-selectors/csscreate.php)에서 차이점을 테스트 할 수 있습니다.

5. **하위 컴포넌트의 선택자 사용을 조심하세요!** 선택자 `.a .b`가 있는 CSS 규칙의 경우 `.a`와 일치하는 요소에 하위 컴포넌트가 포함되어 있을 경우 해당 하위 컴포넌트의 모든 `.b`가 CSS 규칙에 적용됩니다.
