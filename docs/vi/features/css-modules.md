# CSS Modules

> Yêu cầu phiên bản ^9.8.0

[CSS Modules](https://github.com/css-modules/css-modules) is a popular system for modularizing and composing CSS. `vue-loader` provides first-class integration with CSS Modules as an alternative for simulated scoped CSS.

### Sử dụng

``` html
<style module>
.red {
  color: red;
}
.bold {
  font-weight: bold;
}
</style>
```

Thuộc tính `module` sau khi được thêm vào khối `<style>` của bạn như mã nguồn phía trên, sẽ khởi động tính năng CSS Module của `css-loader`. Với tính năng CSS Module, quá trình thực thi `css-loader` trên mã nguồn CSS sẽ đi kèm với hai tác vụ tuần tự:

- Bóc tách các tên class (trừ các tên class được chỉ định giữ nguyên tên thông qua `:global(...)`);

- Gộp chúng vào một object, với `key` là tên ban đầu của từng class, `value` là một **identifier** - giá trị biểu thị tên class thực sự sẽ hiển thị trên DOM (sau quá trình ánh xạ có thể được tùy chỉnh lại trên options của `css-loader`). 

Object này của selector sẽ được **inject** (chèn) vào bên trong ngữ cảnh của Vue component dưới dạng một computed property với cái tên `$style`. Khi đó, việc gọi class đã được *"**CSS Module**-hóa* sẽ hơi có phần dài dòng chút, thông qua `$style` như dưới đây:

``` html
<template>
  <p :class="$style.red">
    Đây là một dòng chữ màu đỏ, hahaha!
  </p>
</template>
```

Bản chất của `$style` là một computed property, do đó ngoài việc gọi trực tiếp một class đơn lẻ như trên, ta cũng có thể bind nhiều class vào thuộc tính `class` cùng một lúc với sự hỗ trợ của cú pháp mảng/đối tượng trong và `v-bind:class` (hoặc viết tắt là `:class`):

``` html
<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      Tui có phải màu đỏ không???
    </p>
    <p :class="[$style.red, $style.bold]">
      Vừa đỏ, vừa đậm!
    </p>
  </div>
</template>
```

`$style` cũng có thể được truy cập trực tiếp từ mã nguồn JS bên trong khối `script` như dưới đây

``` html
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "_1VyoJ-uZOjlOxP7jWUy19_0"
    // identifier được sinh ra dựa trên đường dẫn tuyệt đối của tệp tin mã nguồn và tên gốc của class
  }
}
</script>
```

Mọi chi tiết về CSS Module, tham khảo thêm [tài liệu đặc tả CSS Module](https://github.com/css-modules/css-modules) ví dụ như [ngoại lệ toàn cục](https://github.com/css-modules/css-modules#exceptions) và [kết hợp](https://github.com/css-modules/css-modules#composition).

### Biến style injected với tên tùy biến

Bạn có thể hiện thực nhiều hơn một thẻ `<style>` bên trong một single `*.vue` component. Nếu có từ hai khối style trở lên sử dụng thuộc tính `module`, để tránh việc các biến injected `$style` ghi đè nội dung lẫn nhau trong quá trình thực thi ứng dụng, bạn có thể thay đổi tên biến style injected và sử dụng cùng một lúc các biến đó trong các computed property tương ứng bằng cách truyền cho `module` một giá trị cụ thể (điều này có nghĩa là, mặc định khối `style` được module hóa sẽ injected `$style` nếu giá trị của thuộc tính `module` không được chỉ định):

``` html
<style module="a">
  /* identifiers injected as a */
</style>

<style module="b">
  /* identifiers injected as b */
</style>
```

### Cấu hình truy vấn cho `css-loader`

CSS Modules được thực thi thông qua [css-loader](https://github.com/webpack/css-loader). Với cú pháp `<style module>`, truy vấn mặc định mà `css-loader` sử dụng là:

``` js
{
  modules: true,
  importLoaders: 1,
  localIdentName: '[hash:base64]'
}
```

Khi cần cung cấp truy vấn bổ sung hoặc thay đổi các truy vấn mặc định như trên, ta sẽ sử dụng tùy chọn  `cssModules` bên trong `vue-loader` như đoạn mã phía dưới:

``` js
module: {
  rules: [
    {
      test: '\.vue$',
      loader: 'vue-loader',
      options: {
        cssModules: {
          localIdentName: '[path][name]---[local]---[hash:base64:5]',
          camelCase: true
        }
      }
    }
  ]
}
```
