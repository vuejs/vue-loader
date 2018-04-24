# Introduction

:::tip VERSION NOTE
This is the documentation for Vue Loader v15 and above. If you are upgrading from v14 or an earlier version, check out the [Migration Guide](../migrating.md). If you are using an older version, the old docs are [here](https://vue-loader-v14.vuejs.org).
:::

## What is Vue Loader?

`vue-loader` is a loader for [webpack](https://webpack.js.org/) that allows you to author Vue components in a format called [Single-File Components (SFCs)](./spec.md):

``` vue
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>
```

There are many cool features provided by `vue-loader`:

- Allows using other webpack loaders for each part of a Vue component, for example Sass for `<style>` and Pug for `<template>`;
- Allows custom blocks in a `.vue` file that can have custom loader chains applied to them;
- Treat static assets referenced in `<style>` and `<template>` as module dependencies and handle them with webpack loaders;
- Simulate scoped CSS for each component;
- State-preserving hot-reloading during development.

In a nutshell, the combination of webpack and `vue-loader` gives you a modern, flexible and extremely powerful front-end workflow for authoring Vue.js applications.
