# Пользовательские блоки

Вы можете определять пользовательские блоки внутри файлов `*.vue`. Загрузчики, применяемые к такому блоку, будут определяться сопоставлением по атрибуту `lang` блока, имени тега блока, и правил в вашей конфигурации webpack.

Если указан атрибут `lang`, пользовательский блок будет обработан как файл с расширением, указанном в `lang`.

Вы также можете использовать `resourceQuery` для определения правила для блока без атрибута `lang`. Например, для сопоставления пользовательского блока `<foo>`:

```js
{
  module: {
    rules: [
      {
        resourceQuery: /blockType=foo/,
        loader: "loader-to-use"
      }
    ];
  }
}
```

Если для пользовательского блока будет найдено правило — он будет им обработан; в противном случае пользовательский блок будет тихо проигнорирован.

Кроме того, если пользовательский блок экспортирует функцию в качестве конечного результата после обработки всеми соответствующими загрузчиками, то эта функция будет вызываться с компонентом файла `*.vue` в качестве параметра.

## Пример

Небольшой пример внедрения пользовательского блока `<docs>` в компонент таким образом, что он будет доступен во время выполнения.

Для внедрения содержимого пользовательского блока мы напишем собственный загрузчик:

```js
module.exports = function(source, map) {
  this.callback(
    null,
    `export default function (Component) {
      Component.options.__docs = ${JSON.stringify(source)}
    }`,
    map
  );
};
```

Настроим webpack использовать наш загрузчик для пользовательских блоков `<docs>`.

```js
// wepback.config.js
module.exports = {
  module: {
    rules: [
      {
        resourceQuery: /blockType=docs/,
        loader: require.resolve("./docs-loader.js")
      }
    ]
  }
};
```

Теперь мы можем получить доступ к содержимому блока `<docs>` импортированного компонента на этапе выполнения.

```vue
<!-- ComponentB.vue -->
<template>
  <div>Hello</div>
</template>

<docs>
This is the documentation for component B.
</docs>
```

```vue
<!-- ComponentA.vue -->
<template>
  <div>
    <ComponentB />
    <p>{{ docs }}</p>
  </div>
</template>

<script>
import ComponentB from "./ComponentB.vue";

export default {
  components: { ComponentB },
  data() {
    return {
      docs: ComponentB.__docs
    };
  }
};
</script>
```
