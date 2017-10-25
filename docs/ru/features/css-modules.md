# CSS модули

> требуется версия 9.8.0 или выше

[CSS модули](https://github.com/css-modules/css-modules) — это популярная система для модульности и компоновки CSS. `vue-loader` предоставляет первоклассную интеграцию с CSS модулями как возможную альтернативу эмулируемого scoped CSS.

### Использование

Просто добавьте атрибут `module` к тегу `<style>`:

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

Это включит режим CSS-модулей в `css-loader`, и полученный индентификатор объекта класса будет внедрен в компонент как вычисляемое свойство с именем `$style`. Вы можете использовать его в своих шаблонах для динамического добавления классов:

``` html
<template>
  <p :class="$style.red">
    Этот текст будет красным
  </p>
</template>
```

Поскольку это вычисляемое свойство, оно также будет работать с объектом/массивом в `:class`:

``` html
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

``` html
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "_1VyoJ-uZOjlOxP7jWUy19_0"
    // идентификатор генерируется на основе имени файла и className.
  }
}
</script>
```

Обратитесь к [спецификации CSS-модулей](https://github.com/css-modules/css-modules) для получения информации о [глобальных исключениях](https://github.com/css-modules/css-modules#exceptions) и [композиции](https://github.com/css-modules/css-modules#composition).

### Указание внедряемого имени модуля

У вас может быть более одного `<style>` тега в одном `*.vue` компоненте. Во избежание перезаписи внедряемых стилей вы можете указать имя внедряемого вычисляемого свойства в значении атрибута `module`:

``` html
<style module="a">
  /* идентификатор будет внедрён как a */
</style>

<style module="b">
  /* идентификатор будет внедрён как b */
</style>
```

### Настройка параметров `css-loader`

CSS-модули обрабатываются с помощью [css-loader](https://github.com/webpack/css-loader). При использовании `<style module>` настройки `css-loader` по умолчанию будут такими:

``` js
{
  modules: true,
  importLoaders: true,
  localIdentName: '[hash:base64]'
}
```

Вы можете использовать в `vue-loader` опцию `cssModules` чтобы добавить дополнительные параметры для `css-loader`:

``` js
// webpack 1
vue: {
  cssModules: {
    // другой шаблон для локального имени идентификатора
    localIdentName: '[path][name]---[local]---[hash:base64:5]',
    // использование camelCase
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
