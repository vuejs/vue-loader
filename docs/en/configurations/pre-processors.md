# Using Pre-Processors

In Webpack, all pre-processors need to be applied with a corresponding loader. `vue-loader` allows you to use other Webpack loaders to process a part of a Vue component. It will automatically infer the proper loaders to use from the `lang` attribute of a language block.

### CSS

For example, let's compile our `<style>` tag with SASS:

``` bash
npm install sass-loader node-sass --save-dev
```

``` html
<style lang="sass">
  /* write sass here */
</style>
```

Under the hood, the text content inside the `<style>` tag will be first compiled by `sass-loader` before being passed on for further processing.

#### sass-loader caveat

Contrary to what its name indicates, [*sass*-loader](https://github.com/jtangelder/sass-loader) parses *SCSS* syntax by default. If you actually want to use the indented *SASS* syntax, you have to configure vue-loader's options for sass-loader accordingly. 

```javascript
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      scss: 'vue-style-loader!css-loader!sass-loader' // <style lang="scss">
      sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
    }
  }
}
```

See the [Advanced Loader Configuration](./advanced.md) Section for further information about how to configure vue-loader.

### JavaScript

All JavaScript inside Vue components are processed by `babel-loader` by default. But you can of course change it:

``` bash
npm install coffee-loader --save-dev
```

``` html
<script lang="coffee">
  # Write coffeescript!
</script>
```

### Templates

Processing templates is a little different, because most Webpack template loaders such as `pug-loader` return a template function instead of a compiled HTML string. Instead of using `pug-loader`, we can just install the original `pug`:

``` bash
npm install pug --save-dev
```

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

> **Important:** If you are using `vue-loader@<8.2.0`, you also need to install `template-html-loader`.

### Inline Loader Requests

You can use [Webpack loader requests](https://webpack.github.io/docs/loaders.html#introduction) in the `lang` attribute:

``` html
<style lang="sass?outputStyle=expanded">
  /* use sass here with expanded output */
</style>
```

However, note this makes your Vue component Webpack-specific and not compatible with Browserify and [vueify](https://github.com/vuejs/vueify). **If you intend to ship your Vue component as a reusable 3rd-party component, avoid using this syntax.**
