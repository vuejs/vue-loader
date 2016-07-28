# Scoped CSS

When a `<style>` tag has the `scoped` attribute, its CSS will apply to elements of the current component only. This is similar to the style encapsulation found in Shadow DOM. It comes with some caveats, but doesn't require any polyfills. It is achieved by using PostCSS to transform the following:

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

Into the following:

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

#### Notes

1. You can include both scoped and non-scoped styles in the same component:

  ``` html
  <style>
  /* global styles */
  </style>

  <style scoped>
  /* local styles */
  </style>
  ```

2. A child component's root node will be affected by both the parent's scoped CSS and the child's scoped CSS.

3. Partials are not affected by scoped styles.

4. **Scoped styles do not eliminate the need for classes**. Due to the way browsers render various CSS selectors, `p { color: red }` will be many times slower when scoped (i.e. when combined with an attribute selector). If you use classes or ids instead, such as in `.example { color: red }`, then you virtually eliminate that performance hit. [Here's a playground](http://stevesouders.com/efws/css-selectors/csscreate.php) where you can test the differences yourself.

5. **Be careful with descendant selectors in recursive components!** For a CSS rule with the selector `.a .b`, if the element that matches `.a` contains a recursive child component, then all `.b` in that child component will be matched by the rule.
