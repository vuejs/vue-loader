# Add CSS modules support

## Overview

```html
<!-- use module="xxx" to turn on css modules -->
<style module="style">
  /* local class name */
  .red { color: red; }
  /* is converted to */
  ._8x_KsHmyrocTNd7akA_LL { color: red; }

  /* global class name */
  :global(.red) { color: red; }
  /* is converted to */
  .red { color: red; }

  /* animation name */
  @keyframes fade { from { opacity: 1; } to { opacity: 0; } }
  .animate { animation: fade 1s; }
  /* is converted to */
  @keyframes n5Q3vnbE7aL9uu6uOUOLo { from { opacity: 1; } to { opacity: 0; } }
  ._2hSs7mCBtiABMJoqSnwHAD { animation: n5Q3vnbE7aL9uu6uOUOLo 1s; }
  /* Note: properties in `animation` shorthand should be in correct order. */
</style>

<template>
  <!-- static class name replacement -->
  <!-- Note: static class names in binding expression are also converted -->
  <h2 class="style.red"></h2>
  <h3 class="{{ ['style.red'] }}"></h3>
  <h4 v-bind:class="['style.red']"></h4>
  <h5 :class="['style.red', { 'style.red': isRed }, blue]"></h5>
  <!-- is converted to -->
  <h2 class="_8x_KsHmyrocTNd7akA_LL"></h2>
  <h3 class="{{ ['_8x_KsHmyrocTNd7akA_LL'] }}"></h3>
  <h4 v-bind:class="['_8x_KsHmyrocTNd7akA_LL']"></h4>
  <h5 :class="['_8x_KsHmyrocTNd7akA_LL', { '_8x_KsHmyrocTNd7akA_LL': isRed }, blue]"></h5>
</template>

<!-- get local class name in script -->
<script>
  export default {
    loader: {
      // tell loader to inject `$styles` getter
      styles: '$styles'
    },
    ready() {
      console.log(this.$styles.style.red)
      // => _8x_KsHmyrocTNd7akA_LL
    }
  }
</script>
```

# TODO
- [x] convert static class name in binding class.
- [x] provide style entry in `script`
- [ ] write document

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
