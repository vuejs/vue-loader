# Scoped CSS

Sự xuất hiện của thuộc tính `scoped` trong thẻ `<style>` cho phép mã nguồn CSS bên trong nó được **"scoped"** vào chính component đó (nghĩa là CSS của component sau khi đi qua `css-loader` sẽ chỉ hữu dụng với template của bản thân component, độc lập và không áp dụng ra bên ngoài). Về mặt hình thức, tính năng này tương tự CSS của Shadow DOM.

When a `<style>` tag has the `scoped` attribute, its CSS will apply to elements of the current component only. This is similar to the style encapsulation found in Shadow DOM. Tính năng này đi kèm với một số cảnh báo nho nhỏ sẽ được đề cập ở cuối trang, tuy nhiên nó không yêu cầu bất kỳ polyfill nào. Cơ chế hoạt động của Scoped CSS đơn giản là sử dụng PostCSS để biến đổi mã nguồn từ như thế này...

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
  <div class="example" data-v-f3f3eg9>hi</div>
</template>
```

## Một số bí kíp nhỏ

### Kết hợp scoped style và style toàn cục

Bạn có thể kết hợp khối style không scoped và có scoped trong cùng một component

``` html
<style>
/* global styles */
</style>

<style scoped>
/* local styles */
</style>
```

### Child Component Root Elements

With `scoped`, the parent component's styles will not leak into child components. However, a child component's root node will be affected by both the parent's scoped CSS and the child's scoped CSS. This is by design so that the parent can style the child root element for layout purposes.

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
