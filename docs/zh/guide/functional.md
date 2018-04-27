# Functional Components

Functional components defined as a Single-File Component in a `*.vue` file also receives proper template compilation, Scoped CSS and hot-reloading support.

To denote a template that should be compiled as a functional component, add the `functional` attribute to the template block. This also allows omitting the `functional` option in the `<script>` block.

Expressions in the template are evaluated in the [functional render context](https://vuejs.org/v2/guide/render-function.html#Functional-Components). This means props need to be accessed as `props.xxx` in the template:

``` vue
<template functional>
  <div>{{ props.foo }}</div>
</template>
```

If you need to access properties defined globally on `Vue.prototype`, you can access them on `parent`:

``` vue
<template functional>
  <div>{{ parent.$someProperty }}</div>
</template>
```
