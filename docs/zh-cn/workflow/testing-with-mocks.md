# 用 Mocks 测试

> 这个功能需要 `vue-loader@^7.3.0`。

在实际的应用里，我们的组件很可能有外部依赖，当给组件写单元测试的时候，如果能够模拟这些外部依赖就完美了，这样我们的测试就仅仅依靠测试组件本身的行为。

`vue-loader` 提供了一个功能，借助 [inject-loader](https://github.com/plasticine/inject-loader) 让你可以注入 `*.vue` 组件的任意依赖。大概思路就是，不用真的直接导入模块，而是针对这些模块，使用 `inject-loader` 创建的 “模块工厂” 方法，当工厂方法被调用并传入一个模拟的对象，就会返回相应模块的实例，而模拟对象也注入到该实例里。

假设我们有一个组件，长这样：

``` html
<!-- example.vue -->
<template>
  <div class="msg">{{ msg }}</div>
</template>

<script>
// 这个依赖需要 mock
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

下面展示如何导入 mock 之后的模块：

``` bash
npm install inject-loader --save-dev
```

``` js
// example.spec.js
const ExampleInjector = require('!!vue?inject!./example.vue')
```

注意到 require 用的奇怪字符串 —— 我们这里使用一些内联的 [webpack loader 请求](https://webpack.github.io/docs/loaders.html)。简单讲解一下：

- 开头的 `!!` 表示 "不用全局配置中的所有 loader";
- `vue?inject!` 表示 “使用 `vue` loader，然后传入 `?inject` 查询字符串，告诉 `vue-loader` 使用依赖注入（dependency-injection）模式来编译组件。

返回的 `ExampleInjector` 是一个工厂方法，用来创建一个 `example.vue` 模块的实例。

``` js
const ExampleWithMocks = ExampleInjector({
  // mock it
  '../service': {
    msg: 'Hello from a mocked service!'
  }
})
```

最终，我们可以像平常那样测试这个组件了：

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
