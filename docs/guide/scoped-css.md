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
.example[data-v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" data-v-f3f3eg9>hi</div>
</template>
```

## Mixing Local and Global Styles

You can include both scoped and non-scoped styles in the same component:

``` html
<style>
/* global styles */
</style>

<style scoped>
/* local styles */
</style>
```

## Child Component Root Elements

With `scoped`, the parent component's styles will not leak into child components. However, a child component's root node will be affected by both the parent's scoped CSS and the child's scoped CSS. This is by design so that the parent can style the child root element for layout purposes.

## Deep Selectors

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

Some pre-processors, such as Sass, may not be able to parse `>>>` properly. In those cases you can use the `/deep/` combinator instead - it's an alias for `>>>` and works exactly the same.

## Dynamically Generated Content

DOM content created with `v-html` are not affected by scoped styles, but you can still style them using deep selectors.

## Also Keep in Mind

- **Scoped styles do not eliminate the need for classes**. Due to the way browsers render various CSS selectors, `p { color: red }` will be many times slower when scoped (i.e. when combined with an attribute selector). If you use classes or ids instead, such as in `.example { color: red }`, then you virtually eliminate that performance hit. [Here's a playground](https://stevesouders.com/efws/css-selectors/csscreate.php) where you can test the differences yourself.

- **Be careful with descendant selectors in recursive components!** For a CSS rule with the selector `.a .b`, if the element that matches `.a` contains a recursive child component, then all `.b` in that child component will be matched by the rule.
