# 带作用域的 CSS

当一个 `<style>` 标签有了 `作用域` 属性，它的 CSS 将仅仅作用于当前组件的元素，这跟 Shadow Dom 的样式封装很像。它会引起一些警告，但不需要任何 polyfill。这个功能借助 PostCSS 实现，它会将下面代码：

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

转化为这样的代码：

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

#### 注意

1. 在同一个组件中，你可以同时使用带作用域和不带的：

  ``` html
  <style>
  /* global styles */
  </style>

  <style scoped>
  /* local styles */
  </style>
  ```

2. 一个子组件的根节点会同时受到父组件的 CSS 作用域，以及子组件自身 CSS 作用域的影响。

3. Partials 不受样式作用域影响。

4. **作用域样式不排除使用类选择器**. 根据浏览器渲染不同选择器样式的方式， `p { color: red }` 加上作用域（如，与属性选择器结合）后会慢了几倍。如果你用类或者 ID 选择器代替，如 `.example { color: red }`，基本没有性能问题。[这里有一个测试环境](http://stevesouders.com/efws/css-selectors/csscreate.php)，你可以测试不同选择器的差异。

5. **“多代”组件，慎用后代选择器！** 有一个样式规则使用 `.a .b` 选择器，此时，若匹配 `.a` 的元素包含“多代”子组件的话，则匹配 `.b` 的各代子组件都会应用该样式。
