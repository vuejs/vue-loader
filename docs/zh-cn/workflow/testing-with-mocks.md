# 使用 Mock 测试

在真实世界的应用中，我们的组件很有可能具有外部依赖。在为组件编写单元测试时，理想的状态是我们可以模拟这些外部依赖关系，这样我们的测试只依赖被测组件的行为。

`vue-loader` 提供了一个可以使用 [inject-loader](https://github.com/plasticine/inject-loader) 将任意依赖项注入到 `*.vue` 组件的特性。大体思路是：我们使用 `inject-loader` 为该模块创建一个 “模块工厂” 功能，而不是直接导入组件模块。当使用 mock 对象调用此函数时，它会返回模块的实例，并注入到 mock 中。

假设我们有一个这样的组件：

``` html
<!-- example.vue -->
<template>
  <div class="msg">{{ msg }}</div>
</template>

<script>
// this dependency needs to be mocked
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

以下是使用 mock 导入的方法：

> 注意: inject-loader@3.x 当前是不稳定的。

``` bash
npm install inject-loader@^2.0.0 --save-dev
```

``` js
// example.spec.js
const ExampleInjector = require('!!vue?inject!./example.vue')
```

请注意那些超长的依赖字符串——也就是我们使用的一些内联 [webpack loader 依赖](https://webpack.github.io/docs/loaders.html)。简要解释一下：

- 以 `!!` 打头意味着 “禁用全局配置中的所有 loader”；
- `vue?inject!`意思是 “使用 `vue` loader，并传入 `?inject` 查询”。这告诉 `vue-loader` 在依赖注入模式下编译组件。

返回的 `ExampleInjector` 是一个工厂函数，可以调用它来创建 `example.vue` 模块的实例：

``` js
const ExampleWithMocks = ExampleInjector({
  // mock it
  '../service': {
    msg: 'Hello from a mocked service!'
  }
})
```

最后，我们可以像往常一样测试组件：

``` js
it('should render', () => {
  const vm = new Vue({
    template: '<div><test></test></div>',
    components: {
      'test': ExampleWithMocks
    }
  }).$mount()
  expect(vm.$el.querySelector('.msg').textContent).to.equal('Hello from a mocked service!')
})
```
