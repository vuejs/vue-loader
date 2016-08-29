# Add CSS modules support

## Basic

Convert

```html
<style module="style">
.red {
  color: red;
}
</style>

<template>
  <h2 class="style.red"></h2>
</template>

<script>
module.exports = {}
</script>
```

to:

```html
<style module="style">
._8x_KsHmyrocTNd7akA_LL {
  color: red;
}
</style>

<template>
  <h2 class="_8x_KsHmyrocTNd7akA_LL"></h2>
</template>

<script>
module.exports = {}
</script>
```

## Scoped animation name

```html
<style module="style">
@keyframes fade {
  from { opacity: 1; } to { opacity: 0; }
}
.animate {
  animation: fade 1s;
}
</style>
```

becomes:

```html
<style module="style">
@keyframes n5Q3vnbE7aL9uu6uOUOLo {
  from { opacity: 1; } to { opacity: 0; }
}
.animate {
  animation: n5Q3vnbE7aL9uu6uOUOLo 1s;
}
</style>
```

# TODO
1. convert static class name in binding class.
2. provide style entry in `script`

Note: properties in `animation` shorthand should be in correct order.

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
