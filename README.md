# Add CSS modules support

## Basic

Simply use [CSS modules](https://github.com/css-modules/css-modules) with `<style module="moduleName">` and `class="moduleName.className"`

```html
<style module="style">
  .red { color: red; }
</style>
<template>
  <h2 class="style.red"></h2>
</template>
```

becomes:

```html
<style module="style">
  ._8x_KsHmyrocTNd7akA_LL { color: red; }
</style>
<template>
  <h2 class="_8x_KsHmyrocTNd7akA_LL"></h2>
</template>
```

Class names are unique. So your style won't affect any other component.

Tips:

1. With `module`, animation names are also converted. Feel free to write short class & animation names!
2. With `module` + `scoped`, you can limit your style to your component more strictly.
3. With `module` only, you can style `<slot>` in your component.

## Binding classes

*Static* class names in binding expression are converted, too.

```html
<template>
  <h3 class="{{ ['style.red'] }}"></h3>
  <h4 v-bind:class="['style.red']"></h4>
  <h5 :class="condition ? 'style.red' : ''"></h5>
  <h6 :class="['style.red', { 'style.red': isRed }, blue]"></h6>
</template>
```

becomes:

```html
<template>
  <h3 class="{{ ['_8x_KsHmyrocTNd7akA_LL'] }}"></h3>
  <h4 v-bind:class="['_8x_KsHmyrocTNd7akA_LL']"></h4>
  <h5 :class="condition ? '_8x_KsHmyrocTNd7akA_LL' : ''"></h5>
  <h6 :class="['_8x_KsHmyrocTNd7akA_LL', { '_8x_KsHmyrocTNd7akA_LL': isRed }, blue]"></h6>
</template>
```

Note: Here, "static class name" means class name in single quotes.

Complex ones (eg. `'a' + 'b'`) are not supported (and not recommend in Vue).

## Getting local class name in script

In some cases, you will like to control your class name in script.
You can do it like this:

```html
<script>
  export default {
    loader: {
      // tell loader to inject `$styles` as a computed property.
      styles: '$styles'
    },
    computed: {
      className() {
        if (condition) {
          return this.$style.moduleName.className
        }
        return 'something-else'
      }
    }
  }
</script>
<template>
  <h2 :class="className"></h2>
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
