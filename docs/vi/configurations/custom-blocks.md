# Các khối tùy biến

> Yêu cầu phiên bản 10.2.0+

Bạn có thể định nghĩa các khối ngôn ngữ tùy biến bên trong các tệp `*.vue`. Mã nguồn bên trong các khối ngôn ngữ tùy biến sẽ được xử lý bởi các loader được chỉ định bên trong đối tượng `loaders` của tùy chọn `vue-loader` và được sử dụng bởi component module. Cách thức cấu hình tương tự [Cấu hình Loader nâng cao](../configurations/advanced.md), trừ việc the matching uses the tag name instead of the `lang`.

Nếu loader tương ứng với một khối tùy biến được tìm thấy, nội dung khối tùy biến sẽ được xử lý bởi loader đó; ngược lại khối tùy biến sẽ được bỏ qua. Thêm vào đó, nếu loader được tìm thấy trả về một hàm, hàm này sẽ được gọi với tham số là đối tượng component của tệp `*.vue`.

## Single docs file example

Ví dụ dưới đây sẽ bóc tách toàn bộ mã nguồn các khối `<docs>` thành một tệp tài liệu đơn:

#### component.vue

``` html
<docs>
## Đây là một component ví dụ.
</docs>

<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Component A xin chào!'
    }
  }
}
</script>

<style>
comp-a h2 {
  color: #f00;
}
</style>
```

#### webpack.config.js

``` js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // bóc tách toàn bộ nội dung bên trong <docs> thành các đoạn tài liệu thô
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ]
  },
  plugins: [
    // Lưu toàn bộ tài liệu bóc tách được thành tệp `docs.md`
    new ExtractTextPlugin('docs.md')
  ]
}
```

## Runtime available docs

> Yêu cầu phiên bản 11.3.0+

Ví dụ này sẽ chèn nội dung bên trong khối `<docs>` vào component, cho phép component sử dụng trong quá trình thực thi.

#### docs-loader.js

Chúng ta cần tự viết một loader trong đó cho phép nội dung bên trong khối `docs` được chèn vào bên trong ngữ cảnh của component:

``` js
module.exports = function (source, map) {
  this.callback(null, 'module.exports = function(Component) {Component.options.__docs = ' +
    JSON.stringify(source) +
    '}', map)
}
```

#### webpack.config.js

Bây giờ chúng ta sẽ cấu hình webpack để sử dụng loader phía trên cho khối `docs`.

``` js
const docsLoader = require.resolve('./custom-loaders/docs-loader.js')

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'docs': docsLoader
          }
        }
      }
    ]
  }
}
```

#### component.vue

Ngay bây giờ chúng ta có thể truy cập vào nội dung của khối `<docs>` bên trong những component đã được import trong quá trình thực thi.

``` html
<template>
  <div>
    <component-b />
    <p>{{ docs }}</p>
  </div>
</template>

<script>
import componentB from 'componentB';

export default = {
  data () {
    return {
      docs: componentB.__docs
    }
  },
  components: {componentB}
}
</script>
```
