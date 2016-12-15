# CSS Modules

> requires ^9.8.0

[CSS Modules](https://github.com/css-modules/css-modules)은 CSS을 모듈화하고 구성하는데 널리 사용되는 시스템입니다. `vue-loader`는 스뮬레이트된 범위 CSS의 대안으로 CSS Modules와 함께 first-class intergration을 제공합니다.

### 사용법

`<style>`에 `moudle` 속성을 삽입하니다.

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

이렇게하면 `css-loader`에 대한 CSS Modules 모드가 켜지고 결과적으로 클래스 식별자 오브젝트는 `$style` 이름의 계산된 속성으로 컴포넌트에 주입됩니다. 당신은 동적 클래스 바인딩을 사용하여 템플릿에서 이를 사용할 수 있습니다.

``` html
<template>
  <p :class="$style.red">
    This should be red
  </p>
</template>
```

그것은 계산된 속성이기 때문에 `:class`의 오브젝트/배열 문법에도 작동합니다.

``` html
<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      Am I red?
    </p>
    <p :class="[$style.red, $style.bold]">
      Red and bold
    </p>
  </div>
</template>
```

또한 Javascript에서도 접근할 수 있습니다.

``` html
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "_1VyoJ-uZOjlOxP7jWUy19_0"
    // an identifier generated based on filename and className.
  }
}
</script>
```

[global exceptions](https://github.com/css-modules/css-modules#exceptions)과 [composition](https://github.com/css-modules/css-modules#composition) 같은 자세한 정보는 [CSS Modules 스펙](https://github.com/css-modules/css-modules)을 참고하세요.

### 속성 이름 커스터마이징

하나의 `*.vue` 컴포넌트 내에 하나 이상의 `<style>` 태그를 가질 수 있습니다. 삽입된 스타일이 서로 덮어 쓰지 않게하려면 `module` 속성에 값을 지정하여 계산된 속성의 이름을 커스터마이징할 수 있습니다.

``` html
<style module="a">
  /* identifiers injected as a */
</style>

<style module="b">
  /* identifiers injected as b */
</style>
```

### `css-loader` 쿼리 설정

CSS Modules는 [css-loader](https://github.com/webpack/css-loader)를 통해 처리됩니다. `<style module>`을 사용하면 `css-loader`에 사용되는 기본적인 쿼리는 다음과 같습니다.

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
    // overwrite local ident name
    localIdentName: '[path][name]---[local]---[hash:base64:5]',
    // enable camelCase
    camelCase: true
  }
}

// webpack 2
module: {
  rules: [
    {
      test: '\.vue$',
      loader: 'vue',
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
