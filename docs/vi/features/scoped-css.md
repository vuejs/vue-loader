# Scoped CSS

Sự xuất hiện của thuộc tính `scoped` trong thẻ `<style>` cho phép mã nguồn CSS bên trong nó được **"scoped"** vào chính component đó (nghĩa là CSS của component sau khi đi qua `css-loader` sẽ chỉ hữu dụng với template của bản thân component, độc lập và không áp dụng ra bên ngoài). Về mặt hình thức, tính năng này tương tự CSS của Shadow DOM.

``` html
<style scoped>
.example {
  color: red;
}
</style>

<template>
  <div class="example">Chào!</div>
</template>
```

... sang thế này:

``` html
<style>
.example[data-v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <div class="example" data-v-f3f3eg9>xin chào</div>
</template>
```

## Một số bí kíp nhỏ

### Kết hợp scoped style và style toàn cục

Bạn có thể kết hợp khối style không scoped và có scoped trong cùng một component

``` html
<style>
/* styles toàn cục */
</style>

<style scoped>
/* styles cục bộ */
</style>
```

### Phần tử root của component con

Với thuộc tính `scoped`, style của component cha sẽ không ảnh hưởng đến style bên trong các component con. Tuy nhiên, phần tử root của các component con sẽ bị ảnh hưởng bởi cả scoped CSS của component cha lẫn scoped CSS của bản thân nó. Điều này cho phép component cha điều chỉnh CSS layout của component con bên trong template một cách dễ dàng.

### Deep Selectors

Trong trường hợp Component hiện tại có nhu cầu styling lại những phần tử bên trong các Component con (vốn không bị ảnh hưởng bởi scoped của component cha), hãy dùng toán tử `>>>` như sau

``` html
<style scoped>
.a >>> .b { /* ... */ }
</style>
```

Đoạn CSS trong ví dụ trên sẽ được thông dịch thành

``` css
.a[data-v-f3f3eg9] .b { /* ... */ }
```

Một vài ngôn ngữ tiền-xử-lý CSS, ví dụ như Sass, không tồn tại toán tử `>>>` (và `sass-loader` cũng không thể xử lý toán tử này). Trong trường hợp đó, bạn có thể sử dụng toán tử `/deep/` để thay thế - toán tử này giống hệt `>>>` trừ việc nó được dùng cho Sass, và cách thức làm việc cũng giống y hệt.

### Làm việc với nội dung động

DOM được tạo ra bởi chỉ thị `v-html` không bị ảnh hưởng bởi scoped styles, tuy nhiên với deep selector, bạn cũng có thể styling lại nội dung bên trong.

### Đừng quên ghi nhớ

- **Scoped styles không giảm bớt đi sự cần thiết của classes**. Do cách thức các trình duyệt xử lý và hiển thị (render) CSS, về mặt hiện suất `p { color: red }` sau khi scoped tốc độ render sẽ bị chậm đi khá nhiều lần (do kết hợp với selector thuộc tính vốn có tốc độ render khá chậm). Hãy kết hợp với class hoặc id, ví dụ như `.example { color: red }`, bằng cách đấy tốc độ render sẽ được cái thiện rất nhiều. [Ví dụ so sánh này](https://stevesouders.com/efws/css-selectors/csscreate.php) sẽ cho bạn một cách nhìn trực quan về sự khác biệt đó.

- **Hãy cẩn thận với các selector con trong các component đệ quy!** Với những CSS rule mà selector áp dụng lên các thành phần con như `.a .b` chẳng hạn, trường hợp thành phần cha `.a` chứa các component con lặp lại đệ quy, khi đó rule sẽ áp dụng lên không chỉ thành phần `.b` của component hiện tại, mà là tất cả thành phần `.b` bên dưới nó.
