# Template cho Functional Component

> Được giới thiệu kể từ phiên bản 13.1.0, yêu cầu Vue >= 2.5.0

Kể từ phiên bản `vue-loader >= 13.3.0` trở đi, functional component (component thuần chức năng, không chứa trạng thái và đối tượng `this`) có thể được khai báo như một **single-file-component** bình thường trong một tệp `*.vue`, nhờ vậy loại component này cũng sở hữu được những tính năng hữu ích mà `vue-loader` áp dụng cho một component thông thường, như biên dịch template, scoped CSS và hỗ trợ cả hot-reloading.

Để chỉ rõ một **single-file-component** là một functional component, chỉ cần thêm thuộc tính `functional` vào trong khối `<template>`, điều đó sẽ báo cho `vue-loader` biết rằng, cần biên dịch tệp `*.vue` này thành một functional component. Đồng thời, khối `<script>` có thể không cần được chỉ định trong tệp, hoặc nếu có, thì cũng không cần phải khai báo lại thuộc tính `functional: true` một lần nữa.

Vì không có ngữ cảnh (đối tượng `this`), mọi thứ mà component cần sử dụng được truyền vào thông qua đối tượng gọi là [functional render context](https://vuejs.org/v2/guide/render-function.html#Functional-Components). Khi đó props của component phải được truy cập theo kiểu `props.xxx` như ví dụ về template của một functional component dưới đây:

``` html
<template functional>
  <div>{{ props.foo }}</div>
</template>
```
