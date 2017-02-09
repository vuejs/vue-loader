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
.bold {
  font-weight: bold;
}
</style>
```

This will turn on CSS Modules mode for `css-loader`, and the resulting class identifier object will be injected into the component as a computed property with the name `$style`. You can use it in your templates with a dynamic class binding:

``` html
<template>
  <p :class="$style.red">
    This should be red
  </p>
</template>
```

Since it's a computed property, it also works with the object/array syntax of `:class`:

``` html
<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      Am I red?
    </p>
    <p :class="[$style.red, $style.bold]">
      Red and bold
    </p>
  </div>
</template>
```

And you can also access it from JavaScript:

``` html
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "_1VyoJ-uZOjlOxP7jWUy19_0"
    // an identifier generated based on filename and className.
  }
}
</script>
```

Refer to the [CSS Modules spec](https://github.com/css-modules/css-modules) for mode details such as [global exceptions](https://github.com/css-modules/css-modules#exceptions) and [composition](https://github.com/css-modules/css-modules#composition).

### Custom Inject Name

You can have more than one `<style>` tags in a single `*.vue` component. To avoid injected styles to overwrite each other, you can customize the name of the injected computed property by giving the `module` attribute a value:

``` html
<style module="a">
  /* identifiers injected as a */
</style>

<style module="b">
  /* identifiers injected as b */
</style>
```

### Configuring `css-loader` Query

CSS Modules are processed via [css-loader](https://github.com/webpack/css-loader). With `<style module>`, the default query used for `css-loader` is:

``` js
{
  modules: true,
  importLoaders: true,
  localIdentName: '[hash:base64]'
}
```

You can use vue-loader's `cssModules` option to provide additional query options to `css-loader`:

``` js
// webpack 1
vue: {
  cssModules: {
    // overwrite local ident name
    localIdentName: '[path][name]---[local]---[hash:base64:5]',
    // enable camelCase
    camelCase: true
  }
}

// webpack 2
module: {
  rules: [
    {
      test: '\.vue$',
      loader: 'vue-loader',
      options: {
        cssModules: {
          localIdentName: '[path][name]---[local]---[hash:base64:5]',
          camelCase: true
        }
      }
    }
  ]
}
```
