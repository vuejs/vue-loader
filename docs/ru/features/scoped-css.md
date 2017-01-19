# Scoped CSS

Когда у тега `<style>` есть атрибут `scoped`, то его CSS будет применяться только к элементам текущего компонента. Это похоже на инкапсуляцию стилей в Shadow DOM. Ими можно пользоваться с некоторыми оговорками, но не требуется никаких полифиллов. Это достигается за счёт использования PostCSS для преобразования следующего:

``` html
<style scoped>
.example {
  color: red;
}
</style>

<template>
  <div class="example">hi</div>
</template>
```

В что-то подобное:

``` html
<style>
.example[_v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" _v-f3f3eg9>hi</div>
</template>
```

#### Примечания

1. Вы можете использовать в компоненте локальные и глобальные стили одновременно:

  ``` html
  <style>
  /* глобальные стили */
  </style>

  <style scoped>
  /* локальные стили */
  </style>
  ```

2. A child component's root node will be affected by both the parent's scoped CSS and the child's scoped CSS.

3. Partials are not affected by scoped styles.

4. **Scoped styles do not eliminate the need for classes**. Due to the way browsers render various CSS selectors, `p { color: red }` will be many times slower when scoped (i.e. when combined with an attribute selector). If you use classes or ids instead, such as in `.example { color: red }`, then you virtually eliminate that performance hit. [Here's a playground](http://stevesouders.com/efws/css-selectors/csscreate.php) where you can test the differences yourself.

5. **Be careful with descendant selectors in recursive components!** For a CSS rule with the selector `.a .b`, if the element that matches `.a` contains a recursive child component, then all `.b` in that child component will be matched by the rule.
