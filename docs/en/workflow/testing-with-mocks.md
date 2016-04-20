# Testing with Mocks

> This feature requires `vue-loader@^7.3.0`.

In a real world application, our components most likely have external dependencies. When writing unit tests for components, it would be ideal if we can mock these external dependencies so that our tests only rely the behavior of the component being tested.

`vue-loader` provides a feature that allows you to inject arbitrary dependencies to a `*.vue` component, using [inject-loader](https://github.com/plasticine/inject-loader). The general idea is that instead of directly importing the component module, we use `inject-loader` to create a "module factory" function for that module. When this function gets called with an object of mocks, it returns an instance of the module with the mocks injected.

Suppose we have a component like this:

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

Here's how to import it with mocks:

``` bash
npm install inject-loader --save-dev
```

``` js
// example.spec.js
const ExampleInjector = require('!!vue?inject!./example.vue')
```

Notice that crazy require string - we are using some inline [webpack loader requests](https://webpack.github.io/docs/loaders.html) here. A quick explanation:

- `!!` at the start means "disable all loaders from the global config";
- `vue?inject!` means "use the `vue` loader, and pass in the `?inject` query". This tells `vue-loader` to compile the component in dependency-injection mode.

The returned `ExampleInjector` is a factory function that can be called to create instances of the `example.vue` module:

``` js
const ExampleWithMocks = ExampleInjector({
  // mock it
  '../service': {
    msg: 'Hello from a mocked service!'
  }
})
```

Finally, we can test the component like usual:

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
