# 목업을 위한 테스트

실제 애플리케이션에서는 컴포넌트에 외부 의존성이 있을 가능성이 큽니다. 컴포넌트에 대한 유닛 테스트를 작성할 때 테스트가 테스트 중인 컴포넌트의 동작에만 의존하도록 mock을 만드는 것이 이상적 입니다.

`vue-loader`는 [inject-loader](https://github.com/plasticine/inject-loader)를 사용하여 임의의 의존성을 `*.vue` 컴포넌트에 주입 할 수 있는 기능을 제공합니다. 일반적인 아이디어로 컴포넌트 모듈을 직접 가져오는 대신 `inject-loader`를 사용하여 해당 모듈에 대한 "모듈 팩토리" 함수를 생성하는 것 입니다. 이 함수가 목업 객체와 함께 호출되면 목업 객체가 삽입된 모듈의 인스턴트를 반환합니다.

다음과 같은 컴포넌트가 있다고 가정해봅시다.

``` html
<!-- example.vue -->
<template>
  <div class="msg">{{ msg }}</div>
</template>

<script>
// 이 의존성은 목업이 되야 합니다.
import SomeService from '../service'

export default {
  data () {
    return {
      msg: SomeService.msg
    }
  }
}
</script>
```

목업을 가져오는 방법은 다음과 같습니다.

> 주의: `inject-loader@3.x`는 현재 불안정합니다.

``` bash
npm install inject-loader@^2.0.0 --save-dev
```

``` js
// example.spec.js
const ExampleInjector = require('!!vue?inject!./example.vue')
```

위 코드의 require 문자열은 이상해 보입니다. 여기에는 인라인 [webpack 로더 요청](https://webpack.github.io/docs/loaders.html)이 사용됩니다. 위 코드에 대해서 간단한 설명을 하겠습니다.

- `!!`는 "글로벌 설정에서 모든 로더를 사용하지 못하게 함"을 의미합니다.
- `vue?inject!`는 `vue` 로더를 사용하고 `?inject` 쿼리를 전달한다는 것을 의미합니다. 이것은 `vue-loader`에게 의존성 주입 모드로 컴퍼넌트를 컴파일하도록 알려줍니다.

반환된 `ExampleInjector`는 `example.vue` 모듈의 인스턴스를 생성하기 위해 호출 될 수 있는 팩토리 함수입니다.

``` js
const ExampleWithMocks = ExampleInjector({
  // 가짜로 만듭니다
  '../service': {
    msg: 'Hello from a mocked service!'
  }
})
```

마지막으로 우리는 컴포넌트를 평상시에 테스트 할 수 있습니다.

``` js
it('should render', () => {
  const vm = new Vue({
    template: '<div><test></test></div>',
    components: {
      'test': ExampleWithMocks
    }
  }).$mount()
  expect(vm.$el.querySelector('.msg').textContent).toBe('Hello from a mocked service!')
})
```
