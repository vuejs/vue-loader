# CSS модули

[CSS модули](https://github.com/css-modules/css-modules) — это популярная система для модульности и компоновки CSS. `vue-loader` предоставляет первоклассную интеграцию с CSS модулями как возможную альтернативу эмулируемого локального (scoped) CSS.

## Использование

Во-первых, CSS модули нужно явно включить, передав опцию `modules: true` в `css-loader`:

``` js
// webpack.config.js
{
  module: {
    rules: [
      // ... другие правила опущены
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              // включаем CSS модули
              modules: true,
              // настраиваем генерируемое имя класса
              localIdentName: '[local]_[hash:base64:8]'
            }
          }
        ]
      }
    ]
  }
}
```

Затем, добавляем атрибут `module` к тегу секции `<style>`:

``` vue
<style module>
.red {
  color: red;
}
.bold {
  font-weight: bold;
}
</style>
```

Атрибут `module` подскажет Vue Loader о необходимости внедрить CSS модуль в компонент в качестве вычисляемого свойства с именем `$style`. Вы можете использовать его в шаблонах для динамического добавления классов:

``` vue
<template>
  <p :class="$style.red">
    Текст должен быть красным
  </p>
</template>
```

Поскольку это вычисляемое свойство, оно будет работать с объектом/массивом в `:class`:

``` vue
<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      Буду ли я красным?
    </p>
    <p :class="[$style.red, $style.bold]">
      Красный и жирный
    </p>
  </div>
</template>
```

Вы также можете получить доступ в JavaScript:

``` vue
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "red_1VyoJ-uZ"
    // идентификатор генерируется на основе имени файла и className.
  }
}
</script>
```

Обратитесь к [спецификации CSS-модулей](https://github.com/css-modules/css-modules) для получения информации о [глобальных исключениях](https://github.com/css-modules/css-modules#exceptions) и [композиции](https://github.com/css-modules/css-modules#composition).

## Опциональное использование

Если вы хотите использовать CSS модули только в некоторых компонентах Vue, вы можете использовать правило `oneOf` и проверять наличие строки `module` внутри `resourceQuery`:

``` js
// webpack.config.js -> module.rules
{
  test: /\.css$/,
  oneOf: [
    // это соответствует `<style module>`
    {
      resourceQuery: /module/,
      use: [
        'vue-style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[local]_[hash:base64:5]'
          }
        }
      ]
    },
    // это соответствует простому `<style>` или `<style scoped>`
    {
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }
  ]
}
```

## Использование с пре-процессорами

CSS модули могут быть использованы вместе с другими пре-процессорами:

``` js
// webpack.config.js -> module.rules
{
  test: /\.scss$/,
  use: [
    'vue-style-loader',
    {
      loader: 'css-loader',
      options: { modules: true }
    },
    'sass-loader'
  ]
}
```

## Указание имени внедряемого модуля

У вас может быть несколько тегов `<style>` в одном компоненте `*.vue`. Во избежание перезаписи внедряемых стилей вы можете указать имя внедряемого вычисляемого свойства в значении атрибута `module`:

``` html
<style module="a">
  /* идентификатор будет внедрён как a */
</style>

<style module="b">
  /* идентификатор будет внедрён как b */
</style>
```
