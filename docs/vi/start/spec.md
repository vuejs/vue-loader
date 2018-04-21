# Đặc tả Vue Component

Một tệp tin `*.vue` là một dạng tệp tin tùy biến, trong đó sử dụng cú pháp HTML để mô tả một component của Vue. Mỗi tệp tin `*.vue` gồm ba khối ngôn ngữ, bản chất là các phần tử HTML:  `<template>`, `<script>`, và `<style>`, đôi khi có thêm một số khối tùy biến cũng là các phần tử HTML, tất cả các phần tử đều là top-level:

``` html
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>

<custom1>
  Bất cứ thứ gì, ví dụ như tài liệu ghi chú về component
</custom1>
```

`vue-loader` sẽ phân tích cú pháp của tệp tin, bóc tách mã nguồn trong từng khối ngôn ngữ, truyền chúng qua các loader theo cơ chế ống dẫn để transpile (nếu cần thiết), và cuối cùng hợp nhất các phần mã nguồn đã được transpile thành một đối tượng Vue.js component option (hiểu nôm na là đối tượng JS thuần túy định nghĩa một component Vue.js hoàn chỉnh). Đối tượng này được kết xuất dưới dạng một CommonJS module bằng cách gán vào  `module.exports`.

`vue-loader` cho phép sử dụng ngôn ngữ lập trình khác không-mặc-định bên trong mỗi khối ngôn ngữ, ví dụ như các ngôn ngữ tiền xử lý CSS (SASS, LESS, Stylus, ...) và các ngôn ngữ tiền xử lý HTML (Pug, HAML, ...), bằng cách chỉ định thuộc tính `lang` cho mỗi khối ngôn ngữ. Ví dụ, thay vì dùng CSS, bạn có thể dùng SASS để styling giao diện của component giống như sau:

``` html
<style lang="sass">
  /* viết mã nguồn Sass ở đây! */
</style>
```

Chi tiết hơn, xem thêm tại [sử dụng các bộ tiền xử lý](../configurations/pre-processors.md).

### Các khối ngôn ngữ mặc định

#### `<template>`

- Ngôn ngữ mặc định: `html`.

- Mỗi tệp tin `*.vue` chỉ được chứa nhiều nhất một khối `<template>`.

- Nội dung trong khối sẽ được bóc tách thành một chuỗi (nếu không phải là HTML thì sẽ đi qua các loader để tiền xử lý) và sau cùng là được biên dịch thành các hàm render để sử dụng trong option `template` của Vue component.

#### `<script>`

- Ngôn ngữ mặc định: `js` (cú pháp ES2015 được hỗ trợ tự động nếu phát hiện thấy có `babel-loader` or `buble-loader`).

- Mỗi tệp tin `*.vue` chỉ được chứa nhiều nhất một khối `<script>`.

- Mã nguồn được thực thi trong môi trường CommonJS (tương tự như một module `.js` bình thường được đóng gói bởi Webpack), nghĩa là bạn có thể `require()` những module khác. Và với sự hỗ trợ của cú pháp ES2015, bạn cũng có thể sử dụng những module khác với hai từ khóa `import` và `export`.

- Mã nguồn phải export một [đối tượng đặc tả Vue.js component](https://vuejs.org/v2/api/#Options-Data). Export một hàm tạo mở rộng được khởi tạo bởi `Vue.extend()` cũng được hỗ trợ, tuy nhiên đối tượng JS thuần túy được ưa chuộng hơn vì tính ngắn gọn.

#### `<style>`

- Ngôn ngữ mặc định: `css`.

- Mỗi tệp tin `*.vue` có thể chứa nhiều khối `<style>`, khác với 2 khối ở trên.

- Mỗi thẻ `<style>` có thể chứa các thuộc tính đóng gói css bao gồm `scoped` hoặc `module` (xem thêm [Scoped CSS](../features/scoped-css.md) và [CSS Modules](../features/css-modules.md)) nhằm "bao kín" style vào component hiện tại (đảm bảo style chỉ dùng trong component hiện tại mà không ảnh hưởng đến những component khác). Nhiều thẻ `<style>` với các thuộc tính đóng gói khác nhau có thể trộn lẫn vào trong cùng một component.

- Mặc định, nội dung sẽ được bóc tách và được mã nguồn JS sau-biên-dịch chèn vào thẻ `<head>` của document trong quá trình thực thi, bên trong một thẻ `<style>` bởi `style-loader`. Bạn cũng có thể [cấu hình lại webpack để tất cả các style bên trong các component được bóc tách và hợp nhất vào một tệp tin CSS](../configurations/extract-css.md).

### Khối tùy biến

> Chỉ hỗ trợ trên vue-loader phiên bản 10.2.0+

Các khối tùy chỉnh bổ sung có thể được bao gồm trong tệp `*.vue` cho bất kỳ nhu cầu cụ thể nào của dự án, ví dụ như khối  `<docs>`. `vue-loader` sử dụng tên tag của khối để quyết định xem những loader nào sẽ được áp dụng lên mã nguồn bên trong khối. Những loader đó phải được xác định rõ trong phần `loaders` của `vue-loader` options.

Để biết thêm chi tiết, xem thêm [Custom Blocks](../configurations/custom-blocks.md).

### Src Imports

Trong trường hợp bạn cần phân tách tệp `*.vue` thành nhiều file khác nhau (có thể vì khối lượng code của tệp `*.vue` dần trở nên quá lớn), bạn có thể sử dụng thuộc tính `src` để import một tệp bên ngoài cho khối ngôn ngữ tương ứng. Ví dụ:

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

Cẩn thận một điều, việc import `src` sẽ tuân theo cùng một quy tắc phân giải đường dẫn như lệnh gọi  `require()` của CommonJS, nghĩa là, những đường dẫn tương đối cần phải được bắt đầu với `./`, hoặc có thể import trực tiếp từ một gói NPM đã được cài đặt như sau:

``` html
<!-- import tệp tin bên trong gói npm tên là "todomvc-app-css" -->
<style src="todomvc-app-css/index.css">
```

`src` import cũng khả dụng với các khối tùy biến:

``` html
<unit-test src="./unit-test.js">
</unit-test>
```

### Syntax Highlighting

Currently there is syntax highlighting support for [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Emacs](https://github.com/AdamNiederer/vue-mode), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), and [JetBrains products](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm, etc). Contributions for other editors/IDEs are highly appreciated! If you are not using any pre-processors in Vue components, you can also get by treating `*.vue` files as HTML in your editor.

### Comment trong các khối

Bên trong mã nguồn của mỗi khối, khi cần comment, bạn phải sử dụng cú pháp comment của ngôn ngữ tương ứng trong khối (HTML, CSS, JavaScript, Jade, v.v...). Với những comment top-level tức bên ngoài các khối ngôn ngữ, sử dụng cú pháp comment của HTML: `<!-- đây là một cái comment -->`
