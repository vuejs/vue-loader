# 函数式组件的模板

> 新增于 13.1.0, 需要版本 `Vue >= 2.5.0`

从`vue-loader >= 13.3.0`开始, 在一个`*.vue`文件中，以单文件形式定义的函数式组件，现在对于模板编译、有作用域的 CSS 和热重载功能，也有了良好支持。

要声明一个应该编译为函数式组件的模板，请将`functional`特性添加到模板块中。这样做以后就可以在`<script>`块中省略`functional`选项。

模板中的表达式会在[函数式渲染上下文](https://cn.vuejs.org/v2/guide/render-function.html#函数式组件)中求值。这意味着在模板中，prop需要以`props.xxx`的形式访问：
```html
    <template functional>
       <div>{{ props.foo }}</div>
    </template>
```
