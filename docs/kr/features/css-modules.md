# CSS 모듈

> 9.8.0 이상 버전을 요구합니다

[CSS 모듈](https://github.com/css-modules/css-modules)은 CSS을 모듈화하고 구성하는데 널리 사용되는 시스템입니다. `vue-loader`는 시뮬레이트된 범위 CSS의 대안으로 CSS 모듈과 함께 1급 클래스로의 통합을 제공합니다.

### 사용법

`<style>`에 `module` 속성을 삽입합니다.

``` html
<style module>
.red {
  color: red;
}
.bold {
  font-weight: bold;
}
</style>
```

이렇게하면 `css-loader`에 대한 CSS 모듈 모드가 켜지고 결과적으로 클래스 식별자 오브젝트는 `$style` 이름의 계산된 속성으로 컴포넌트에 주입됩니다. 동적 클래스 바인딩을 사용하여 템플릿에서 이를 사용할 수 있습니다.

``` html
<template>
  <p :class="$style.red">
    이것은 빨간색이야
  </p>
</template>
```

이는 계산된 속성이기 때문에 `:class`의 오브젝트/배열 문법에도 작동합니다.

``` html
<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      나는 빨간색이야?
    </p>
    <p :class="[$style.red, $style.bold]">
      나는 빨간색이면서 볼드야
    </p>
  </div>
</template>
```

또한 JavaScript에서도 접근할 수 있습니다.

``` html
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "_1VyoJ-uZOjlOxP7jWUy19_0"
    // 파일 이름과 className을 기반으로 생성된 식별자
  }
}
</script>
```

[전역 예외사항](https://github.com/css-modules/css-modules#exceptions)과 [구성](https://github.com/css-modules/css-modules#composition) 같은 자세한 정보는 [CSS 모듈 스펙](https://github.com/css-modules/css-modules)을 참고하세요.

### 사용자 정의 이름 주입

하나의 `*.vue` 컴포넌트 내에 하나 이상의 `<style>` 태그를 가질 수 있습니다. 삽입된 스타일이 서로 덮어 쓰지 않게하려면 `module` 속성에 값을 지정하여 계산된 속성의 이름을 사용자 정의할 수 있습니다.

``` html
<style module="a">
  /* a로 주입된 식별자 */
</style>

<style module="b">
  /* b로 주입된 식별자 */
</style>
```

### `css-loader` 쿼리 설정

CSS 모듈은 [css-loader](https://github.com/webpack/css-loader)를 통해 처리됩니다. `<style module>`을 사용하면 `css-loader`에 사용되는 기본적인 쿼리는 다음과 같습니다.

``` js
{
  modules: true,
  importLoaders: true,
  localIdentName: '[hash:base64]'
}
```

당신은 vue-loader의 `cssModules` 옵션을 사용하여 `css-loader`에 추가적인 쿼리 옵션을 제공할 수 있습니다.

``` js
// webpack 1
vue: {
  cssModules: {
    // 로컬 ID값을 덮어 씁니다.
    localIdentName: '[path][name]---[local]---[hash:base64:5]',
    // camelCase를 사용합니다
    camelCase: true
  }
}

// webpack 2
module: {
  rules: [
    {
      test: '\.vue$',
      loader: 'vue-loader',
      options: {
        cssModules: {
          localIdentName: '[path][name]---[local]---[hash:base64:5]',
          camelCase: true
        }
      }
    }
  ]
}
```
