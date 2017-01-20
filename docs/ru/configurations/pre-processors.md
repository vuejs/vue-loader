# Использование пре-процессоров

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

#### Особенность sass-loader

Вопреки тому, что он называется [*sass*-loader](https://github.com/jtangelder/sass-loader), по умолчанию парсится синтаксис *SCSS*. Если вы на самом деле хотите использовать синтаксис *SASS* с отступами, вам требуется настроить vue-loader для sass-loader соответственно. 

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

Весь JavaScript внутри Vue компонентов обрабатывается `babel-loader` по умолчанию. При необходимости это можно изменить:

``` bash
npm install coffee-loader --save-dev
```

``` html
<script lang="coffee">
  # Пишем на coffeescript!
</script>
```

### Шаблоны

Обработка шаблонов выполняется несколько иначе, потому что большинство loader'ов шаблонов Webpack, например `pug-loader`, возвращают функцию шаблона вместо скомпилированного в строку HTML. Поэтому вместо использования `pug-loader`, можно просто установить оригинальный `pug`:

``` bash
npm install pug --save-dev
```

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

> **Внимание:** При использовании `vue-loader@<8.2.0`, вам также необходимо установить `template-html-loader`.

### Inline Loader Requests

You can use [Webpack loader requests](https://webpack.github.io/docs/loaders.html#introduction) in the `lang` attribute:

``` html
<style lang="sass?outputStyle=expanded">
  /* use sass here with expanded output */
</style>
```

However, note this makes your Vue component Webpack-specific and not compatible with Browserify and [vueify](https://github.com/vuejs/vueify). **If you intend to ship your Vue component as a reusable 3rd-party component, avoid using this syntax.**
