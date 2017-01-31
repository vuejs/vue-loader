#Тестирование с моками (ээм)

В настоящих приложениях, наши компоненты скорее всего будут иметь внешние зависимости. Было бы прекрасно, если бы мы могли "передразнивать" эти зависимости в наших тестах, чтобы они опирались только на поведение тестируемого компонента.

`vue-loader` предоставляет возможность внедрять произвольные зависимости в `*.vue` компоненты, используя [inject-loader](https://github.com/plasticine/inject-loader). Основная идея состоит в том, что вместо прямой подгрузки модуля компонента мы используем `inject-loader`, чтобы создать "фабричную функцию" для этого модуля. Когда мы вызовем эту функцию с мок-объектом, она вернет нам экземпляр модуля с внедренными мок-объектами.

Допустим, у нас есть следующий компонент:

``` html
<!-- example.vue -->
<template>
  <div class="msg">{{ msg }}</div>
</template>

<script>
// эту зависимость нужно "передразнить"
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

Вот как получить его с мок-объектами:

> Заметка: inject-loader@3.x еще не в стабильной версии

``` bash
npm install inject-loader@^2.0.0 --save-dev
```

``` js
// example.spec.js
const ExampleInjector = require('!!vue?inject!./example.vue')
```

Обратите внимание на эту безумную строку импорта. - мы используем [запросы к webpack загрузчику](https://webpack.github.io/docs/loaders.html). Краткое пояснение:
Notice that crazy require string - we are using some inline [webpack loader requests](https://webpack.github.io/docs/loaders.html) here. A quick explanation:

- `!!` в начале строки означает "отключи все загрузчики из глобальной конфигурации"
- `vue?inject!` значит "используй `vue` загрузчик и передай запрос `?inject`". Это заставляет `vue-loader` скомпилировать компонент в режиме внедрения зависимостей.

Полученный `ExampleInjector` - это фабричная функция, которую можно вызвать, чтобы создать экземпляр модуля `example.vue`:

``` js
const ExampleWithMocks = ExampleInjector({
  // mock it
  '../service': {
    msg: 'Привет от мок-сервиса!'
  }
})
```

Наконец, мы можем тестировать компонент как обычно:

``` js
it('should render', () => {
  const vm = new Vue({
    template: '<div><test></test></div>',
    components: {
      'test': ExampleWithMocks
    }
  }).$mount()
  expect(vm.$el.querySelector('.msg').textContent).toBe('Привет от мок-сервиса!')
})
```
