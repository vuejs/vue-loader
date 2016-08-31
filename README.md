# Add CSS modules support

Simply use CSS Modules with `<style module="moduleName">`.

`moudleName` will be injected as a computed property.

Example:

```html
<style module="style">
  .red { color: red; }
  /*
    becomes
    ._8x_KsHmyrocTNd7akA_LL { color: red; }
  */
</style>

<script>
  export default {
    ready() {
      console.log(this.style.red)
      // => _8x_KsHmyrocTNd7akA_LL
    }
  }
</script>

<template>
  <h2 v-bind:class="style.red"></h2>
</template>
```

# Original README below:

# vue-loader [![Build Status](https://circleci.com/gh/vuejs/vue-loader/tree/master.svg?style=shield)](https://circleci.com/gh/vuejs/vue-loader/tree/master) [![npm package](https://img.shields.io/npm/v/vue-loader.svg?maxAge=2592000)](https://www.npmjs.com/package/vue-loader)

> Vue.js component loader for [Webpack](http://webpack.github.io).

It allows you to write your components in this format:

![screenshot](http://blog.evanyou.me/images/vue-component.png)

For detailed usage, checkout the [documentation](http://vuejs.github.io/vue-loader/).

There are also some example projects:

- [vue-loader-example](https://github.com/vuejs/vue-loader-example/)
- [vue-hackernews](https://github.com/vuejs/vue-hackernews)

## License

[MIT](http://opensource.org/licenses/MIT)
