# Пользовательские блоки

> Доступно в версиях 10.2.0+

Вы можете определять пользовательские блоки внутри `*.vue` файлов. Содержимое пользовательских блоков будет обрабатываться загрузчиками, указанными в объекте `loaders` настроек `vue-loader` и затем подключено модулем к компоненту. Конфигурация аналогична тому, что описано в разделе [продвинутой конфигурации загрузчиков](../configurations/advanced.md), за исключением совпадений по имени тега, вместо атрибута `lang`.

Если подходящий загрузчик будет найден для пользовательского блока, он будет обработан; в противном случае пользовательский блок будет просто проигнорирован. Кроме того, если найденный загрузчик возвращает функцию, эта функция будет вызываться с компонентом из файла `*.vue` в качестве параметра.

## Пример создания единого файла документации

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
// webpack 2.x
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // извлечь всё содержимое тегов <docs> как обычный текст
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ]
  },
  plugins: [
    // вывести всю документацию в отдельный файл
    new ExtractTextPlugin('docs.md')
  ]
}
```

## Документация доступная во время выполнения

Вот пример того, как можно встроить пользовательские блоки `<docs>` в компонент, чтобы он был доступен во время выполнения.

#### docs-loader.js

Для инъекции содержимого пользовательского блока понадобится пользовательский загрузчик:

``` js
module.exports = function (source, map) {
  this.callback(null, 'module.exports = function(Component) {Component.options.__docs = ' +
    JSON.stringify(source) +
    '}', map)
}
```

#### webpack.config.js

Теперь необходимо настроить webpack использовать наш загрузчик для пользовательских блоков `<docs>`.

``` js
const docsLoader = require.resolve('./custom-loaders/docs-loader.js')

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'docs': docsLoader
          }
        }
      }
    ]
  }
}
```

#### component.vue

Теперь мы можем получить доступ к содержимому блока `<docs>` импортированного компонента на этапе выполнения.

``` html
<template>
  <div>
    <component-b />
    <p>{{ docs }}</p>
  </div>
</template>

<script>
import componentB from 'componentB';

export default = {
  data () {
    return {
      docs: componentB.__docs
    }
  },
  components: {componentB}
}
</script>
```
