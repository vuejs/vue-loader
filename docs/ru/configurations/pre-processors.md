# Использование пре-процессоров

В Webpack все пре-процессоры должны быть применены с соответствующим загрузчиком. `vue-loader` позволяет вам использовать другие загрузчики Webpack для обработки секций компонентов Vue. Они будут автоматически вызваны для обработки секций на основе указанного атрибута `lang` у секции файла.

### CSS

Например, пусть в теге `<style>` будет использоваться SASS:

``` bash
npm install sass-loader node-sass --save-dev
```

``` html
<style lang="sass">
  /* используем SASS здесь */
</style>
```

В недрах, текстовое содержимое тега `<style>` будет сперва скомпилировано с помощью `sass-loader` перед передачей для дальнейшей обработки.

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

Обратитесь к разделу [продвинутой конфигурации загрузчиков](./advanced.md) для получения дополнительной информации о том, как настраивать vue-loader.

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
  /* используем SASS с расширенным выводом */
</style>
```

However, note this makes your Vue component Webpack-specific and not compatible with Browserify and [vueify](https://github.com/vuejs/vueify). **If you intend to ship your Vue component as a reusable 3rd-party component, avoid using this syntax.**
