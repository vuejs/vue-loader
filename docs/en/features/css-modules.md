# CSS Modules

> requires ^9.8.0

[CSS Modules](https://github.com/css-modules/css-modules) is a popular system for modularizing and composing CSS. `vue-loader` provides first-class integration with CSS Modules as an alternative for simulated scoped CSS.

### Usage

Just add the `module` attribute to your `<style>`:

``` html
<style module>
.red {
  color: red;
}
</style>
```

This will turn on CSS Modules mode for `css-loader`, and the resulting class identifier object will be injected into the component as a computed property with the name `$style`. To use it in your templates, you need to use a dynamic class binding:

``` html
<template>
  <p :class="$style.red">
    This should be red
  </p>
</template>
```

Since it's a computed property, you can also access it from JavaScript:

``` js
<script>
export default {
  created () {
    console.log(this.$style.red) // "_1VyoJ-uZOjlOxP7jWUy19_0"
  }
}
</script>
```

Refer to the [CSS Modules spec](https://github.com/css-modules/css-modules) for mode details such as [global exceptions](https://github.com/css-modules/css-modules#exceptions) and [composition](https://github.com/css-modules/css-modules#composition).

### Custom Inject Name

You can have more than one `<style>` tags in a single `*.vue` component. To avoid injected styles to overwrite each other, you can customize the name of the injected computed property by giving the `module` attribute a value:

``` html
<style module="a">
  /* identifiers injected as $a */
</style>

<style module="b">
  /* identifiers injected as $b */
</style>
```

### Configuring Local Indentifier Name

By default, class names are transformed unique identifiers in the form of `[hash:base64]`, but you can configure it by providing the `cssModules.localIdentName` option to `vue-loader`:

``` js
// wepback 1
vue: {
  cssModules: {
    localIdentName: '[path][name]---[local]---[hash:base64:5]'
  }
}

// webpack 2
module: {
  rules: [
    {
      test: '\.vue$',
      loader: 'vue',
      options: {
        cssModules: {
          localIdentName: '[path][name]---[local]---[hash:base64:5]'
        }
      }
    }
  ]
}
```
