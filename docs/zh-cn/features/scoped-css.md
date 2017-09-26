# CSS 作用域

当 `<style>` 标签有 `scoped` 属性时，它的 CSS 只作用于当前组件中的元素。这类似于 Shadow DOM 中的样式封装。它有一些注意事项，但不需要任何 polyfills。它通过使用 PostCSS 来实现以下转换：

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

转换结果：

``` html
<style>
.example[data-v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" data-v-f3f3eg9>hi</div>
</template>
```

## Tips

### Mixing Local and Global Styles

You can include both scoped and non-scoped styles in the same component:

``` html
<style>
/* global styles */
</style>

<style scoped>
/* local styles */
</style>
```

### Child Component Root Elements

With `scoped`, the parent component's styles will not leak into child components. However, a child component's root node will be affected by both the parent's scoped CSS and the child's scoped CSS. This is by design so that the the parent can style the child root element for layout purposes.

### Deep Selectors

If you want a selector in `scoped` styles to be "deep", i.e. affecting child components, you can use the `>>>` combinator:

``` html
<style scoped>
.a >>> .b { /* ... */ }
</style>
```

The above will be compiled into:

``` css
.a[data-v-f3f3eg9] .b { /* ... */ }
```

Some pre-processors, such as SASS, may not be able to parse `>>>` properly. In those cases you can use the `/deep/` combinator instead - it's an alias for `>>>` and works exactly the same.

### Dynamically Generated Content

DOM content created with `v-html` are not affected by scoped styles, but you can still style them using deep selectors.

### Also Keep in Mind

- **Scoped styles do not eliminate the need for classes**. Due to the way browsers render various CSS selectors, `p { color: red }` will be many times slower when scoped (i.e. when combined with an attribute selector). If you use classes or ids instead, such as in `.example { color: red }`, then you virtually eliminate that performance hit. [Here's a playground](https://stevesouders.com/efws/css-selectors/csscreate.php) where you can test the differences yourself.

**Be careful with descendant selectors in recursive components!** For a CSS rule with the selector `.a .b`, if the element that matches `.a` contains a recursive child component, then all `.b` in that child component will be matched by the rule.

<!-- #### 注意

1. 你可以在一个组件中同时使用 scoped 和 non-scoped styles

  ``` html
  <style>
  /* global styles */
  </style>

  <style scoped>
  /* local styles */
  </style>
  ```

2. 子组件的根节点将同时受父组件和子组件作用域 CSS 的影响。

3. Partials 不受作用域样式影响。

4. **CSS 作用域不能代替 classes**。考虑到浏览器渲染各种 CSS 选择器的方式，当使用 scoped 时，`p { color: red }` 在作用域中会慢很多倍 (即当与属性选择器组合时)。如果你使用 classes 或者 ids 代替，比如 `.example { color: red }`，这样几乎没有性能影响。你可以在[这块试验田](https://stevesouders.com/efws/css-selectors/csscreate.php)测试它们的不同。

5. **在递归组件中小心使用后代选择器!** 对于带有选择器 `.a .b` 的CSS 规则，如果元素 `.a` 包含递归子组件，所有的子组件中的 `.b` 会被匹配。

6. 如果 `scoped` 样式中需要嵌套的选择器，你得在 CSS 中使用 `>>>` 操作符，且在 `scss` 中使用 `/deep/`：

    ``` html
    <style scoped>
    .a >>> .b {

    }
    </style>

    <style lang="scss" scoped>
    .a /deep/ .b {

    }
    </style>
    ``` -->
