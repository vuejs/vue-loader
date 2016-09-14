# CSS Modules

[CSS Modules](https://github.com/css-modules/css-modules) aims to solve class & animation name conflicts. It replaces all the local names with unique hashes and provides a name-to-hash map. So you can write short and general names without worrying any conflict!

With vue-loader, you can simply use CSS Modules with `<style module>`.

The name-to-hash map `$style` will be injected as a computed property.

Example:

```html
<style module>
  .red { color: red; }
  /*
    becomes
    ._8x_KsHmyrocTNd7akA_LL { color: red; }
  */
</style>

<template>
  <h2 v-bind:class="$style.red"></h2>
</template>

<script>
  export default {
    ready() {
      console.log(this.$style.red)
      // => _8x_KsHmyrocTNd7akA_LL
    }
  }
</script>
```

If you need mutiple `<style>` tags with `module` (or you hate `$style` being injected), you can specify the module name with `<style module="moduleName">`. `moduleName` will get injected instead.

Example:

```html
<style module="foo" src="..."></style>
<style module="bar" src="..."></style>

<template>
  <h2 v-bind:class="foo.red"></h2>
  <h2 v-bind:class="bar.red"></h2>
</template>
```

## Tips

1. Animation names also get transformed. So, it's recommended to use animations with CSS modules.

2. You can use `scoped` and `module` together to avoid problems in descendant selectors.

3. Use `module` only (without `scoped`), you are able to style `<slot>`s and children components. But styling children components breaks the principle of components. You can put `<slot>` in a classed wrapper and style it under that class.

4. You can expose the class name of component's root element for theming.
