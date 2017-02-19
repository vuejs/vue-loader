# Пользовательские блоки

> Доступно в версиях 10.2.0+

Вы можете определять пользовательски блоки внутри `*.vue` файлов. Содержимое пользовательских блоков будет обрабатываться загрузчиками, указанными в объекте `loaders` настроек `vue-loader` и затем подключено модулем к компоненту. Конфигурация аналогична тому, что описано в разделе [продвинутой конфигурации загрузчиков](../configurations/advanced.md), за исключением совпадений по имени тега, вместо атрибута `lang`.

Если подходящий загрузчик будет найден для пользовательского блока, он будет обработан; в противном случае пользовательский блок будет просто проигнорирован.

## Пример

Пример извлечения всех пользовательских блоков `<docs>` в отдельный файл документации:

#### component.vue

``` html
<docs>
## Это пример компонента.
</docs>

<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>

<style>
comp-a h2 {
  color: #f00;
}
</style>
```

#### webpack.config.js

``` js
// Webpack 2.x
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          loaders: {
            // извлечь всё содержимое тегов <docs> как обычный текст
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ],
    plugins: [
      // вывести всю документацию в отдельный файл
      new ExtractTextPlugin('docs.md')
    ]
  }
}
```
