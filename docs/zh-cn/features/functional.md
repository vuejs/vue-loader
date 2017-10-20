# 函数式组件的模板

> 新增于13.1.0, 需要Vue版本 >= 2.5.0

从`vue-loader >= 13.3.0`开始, 在一个`*.vue`文件中，以单文件组件定义的函数式组件，现在得到了对模板编译、Scoped CSS和热重载的良好支持。

要声明一个应该编译为函数式组件的模板，请将`functional`属性添加到 template 块中。这也允许在`<script>`块中省略`functional`选项。

模板中的表达式会在[函数式渲染上下文](https://cn.vuejs.org/v2/guide/render-function.html#函数式组件)中求值。这意味着在模板中，props需要以`props.xxx`的形式访问：
```html
    <template functional>
	    <div>{{ props.foo }}</div>
    </template>
```
