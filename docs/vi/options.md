# Danh sách các tùy chọn

## Vị trí thiết lập tùy chọn

``` js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // các tùy chọn `vue-loader`
        }
      }
    ]
  }
}
```

### loaders

- Kiểu: `{ [lang: string]: string | Object | Array }`

  Một đối tượng chỉ định rõ các loader của webpack nhằm ghi đè các loader mặc định được sử dụng cho các khối ngôn ngữ bên trong các tệp `*.vue`. Thuộc tính của đối tượng tương ứng với thuộc tính `lang` trong các khối ngôn ngữ. Mặc định `lang` cho mỗi kiểu khối ngôn ngữ là:

  - `<template>`: `html`
  - `<script>`: `js`
  - `<style>`: `css`

  Ví dụ, để sử dụng `babel-loader` và `eslint-loader` để xử lý tất cả các khối `<script>`:

  ``` js
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader!eslint-loader'
          }
        }
      }
    ]
  }
  ```

  Bạn có thể sử dụng cú pháp *object* hoặc *array* (note the options must be serializable):

  ``` js
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: [
              { loader: 'cache-loader' },
              { loader: 'babel-loader', options: { presets: ['env'] } }
            ]
          }
        }
      }
    ]
  }
  ```

### preLoaders

- Kiểu: `{ [lang: string]: string }`

  Định dạng cấu hình tương tự như `loaders`, tuy nhiên `preLoaders` được áp dụng trên khối ngôn ngữ tương ứng trước khi các loader mặc định được thực thi. Sử dụng tùy chọn này để tiền-xử-lý các khối ngôn ngữ - một ví dụ phổ biến là biên dịch các khối mô tả đa ngôn ngữ i18n.

### postLoaders

- Kiểu: `{ [lang: string]: string }`

  Định dạng cấu hình tương tự như `loaders`, tuy nhiên `postLoaders` được áp dụng ngay sau khi các loader mặc định được thực thi. Sử dụng tùy chọn này để hậu-xử-lý các khối ngôn ngữ. Tuy nhiên lưu ý rằng `postLoaders` hoạt động hơi phức tạp một chút:

  - Với `html`, kết xuất được trả về bởi loader mặc định sẽ được biên dịch thành các hàm render JavaScript.

  - Với `css`, kết xuất được trả về bởi `vue-style-loader` không đặc biệt hữu ích trong hầu hết các trường hợp. Sử dụng plugin PostCSS sẽ là lựa chọn tốt hơn.

### postcss

> Lưu ý: Việc sử dụng tệp cấu hình PostCSS được khuyến khích, nhằm mục đích cho phép các khối style bên trong các tệp `*.vue` và các tệp CSS bình thường có thể chia sẻ chung một cấu hình PostCSS. [Cách thức cấu hình tương tự `postcss-loader`](https://github.com/postcss/postcss-loader#usage).

- Kiểu: `Array` hoặc `Function` hoặc `Object`

  Thiết lập danh sách các plugin PostCSS sẽ được áp dụng lên CSS bên trong các tệp `*.vue`. Nếu sử dụng hàm, hàm này sẽ được gọi với cùng ngữ cảnh của loader và trả về một `Array` các plugin.

  ``` js
  // ...
  {
    loader: 'vue-loader',
    options: {
      // Lưu ý: không được lồng tùy chọn `postcss` bên dưới `loaders`
      postcss: [require('postcss-cssnext')()],
      loaders: {
        // ...
      }
    }
  }
  ```

  Tùy chọn này cũng có thể nhận một đối tượng trong đó chứa các tùy chọn khác có thể được truyền vào cho bộ xử lý PostCSS. Điều này rất hữu ích khi trong một dự án PostCSS sử dụng các bộ phân tích cú pháp/biến đổi chuỗi tùy biến.:

  ``` js
  postcss: {
    plugins: [...], // Danh sách các plugin
    options: {
      parser: sugarss // sử dụng bộ phân tích cú pháp sugarss
    }
  }
  ```

### postcss.config

> Được giới thiệu từ phiên bản 13.2.1

- Kiểu: `Object`
- Mặc định: `undefined`

  Tùy chọn này cho phép thay đổi cấu hình PostCSS tương tự như [postcss-loader](https://github.com/postcss/postcss-loader#config-1).

  - **postcss.config.path**

    Chỉ định một đường dẫn (tệp tin hoặc thư mục) chứa tệp cấu hình PostCSS cần load.

    ``` js
    postcss: {
      config: {
        path: path.resolve('./src')
      }
    }
    ```

  - **postcss.config.ctx**

    Cung cấp đối tượng ngữ cảnh cho các plugin PostCSS. Xem [tài liệu postcss-loader](https://github.com/postcss/postcss-loader#context-ctx) để biết thêm chi tiết.

### postcss.useConfigFile

> Được giới thiệu từ phiên bản 13.6.0

- Kiểu: `boolean`
- Mặc định: `true`

  Đặt giá trị là `false` để vô hiệu hóa việc sử dụng tệp cấu hình PostCSS.

### cssSourceMap

- Kiểu: `boolean`
- Mặc định: `true`

  Cho phép sử dụng source maps trong CSS. Vô hiệu hóa tính năng này có thể giúp tránh được các lỗi liên quan đến đường dẫn tương đối trong `css-loader` và giúp cho quá trình build được nhanh hơn.

  Lưu ý rằng tùy chọn này mặc định có giá trị là `false` nếu tùy chọn `devtool` không tồn tại trong tệp cấu hình webpack.

### postcss.cascade

> Được giới thiệu từ phiên bản 14.2.0

- Kiểu: `boolean`
- Mặc định: `false`

  Set this to `true` to enable cascading PostCSS config file loading. Ví dụ, you can have extra `.postcssrc` files in nested source directories to apply different PostCSS configs to different files in your project.

### esModule

> Tùy chọn này đã được loại bỏ từ phiên bản v14.0. Từ v14.0 trở về sau, mọi tệp `*.vue` luôn luôn được biên dịch thành các ES module.

- Kiểu: `boolean`
- Mặc định: `true` (v13.0+)

  Whether to emit esModule compatible code. Mặc định vue-loader will emit default export in commonjs format like `module.exports = ....`. When `esModule` is set to true, default export will be transpiled into `exports.__esModule = true; exports = ...`. Useful for interoperating with transpiler other than Babel, like TypeScript.

  > Lưu ý về phiên bản: từ v12.x trở lên, giá trị mặc định là `false`.

### preserveWhitespace

- Kiểu: `boolean`
- Mặc định: `true`

  Nếu giá trị là `false`, khoảng trắng giữa các HTML tag bên trong templates sẽ được loại bỏ.

### compilerModules

- Kiểu: `Array<ModuleOptions>`
- Mặc định: `[]`

  Cấu hình tùy chọn `modules` cho `vue-template-compiler`. Chi tiết hơn, xem thêm [tùy chọn `modules`](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options) của `vue-template-compiler`.

### compilerDirectives

- Kiểu: `{ [tag: string]: Function }`
- Mặc định: `{}` (v13.0.5+)

  > Lưu ý về phiên bản: in v12.x, supported in v12.2.3+

  Cấu hình tùy chọn `directives` cho `vue-template-compiler`, Chi tiết hơn, xem thêm [tùy chọn `directives`](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options) của `vue-template-compiler`.

### transformToRequire

- Kiểu: `{ [tag: string]: string | Array<string> }`
- Mặc định: `{ img: 'src', image: 'xlink:href' }`

  Trong suốt quá trình biên dịch template, bộ biên dịch sẽ biến đổi một số các thuộc tính HTML nhất định, ví dụ như `src` URL thành lệnh gọi `require` để webpack có thể xử lý được các tệp tài nguyên đích. Cấu hình mặc định sẽ biến đổi thuộc tính `src` trong thẻ `<img>` và thuộc tính `xlink:href` trong thẻ `<image>` của SVG.

### buble

- Kiểu: `Object`
- Mặc định: `{}`

  Cấu hình tùy chọn cho `buble-loader` (nếu hữu dụng), AND the buble compilation pass for template render functions.

  > Lưu ý về phiên bản: từ phiên bản 9.x, the template expressions are configured separately via the now removed `templateBuble` option.

  The template render functions compilation supports a special transform `stripWith` (enabled by default), which removes the `with` usage in generated render functions to make them strict-mode compliant.

  Cấu hình ví dụ:

  ``` js
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          buble: {
            // same options
          }
        }
      }
    ]
  }
  ```

### extractCSS

> Được giới thiệu từ phiên bản 12.0.0

- Kiểu: `boolean`
- Mặc định: `false`

  Tự động bóc tách CSS với `extract-text-webpack-plugin`. Works for most tiền-xử-lý out of the box, và xử lý tác vụ nén mã nguồn CSS trong chế độ production rất tốt.

  Giá trị có thể là `true`, hoặc là một instance của plugin (điều này cho phép bạn sử dụng nhiều instance của plugin để bóc tách thành nhiều tệp CSS khác nhau).

  Chỉ nên sử dụng trong chế độ production.

  Ví dụ:

  ``` js
  // webpack.config.js
  var ExtractTextPlugin = require("extract-text-webpack-plugin")

  module.exports = {
    // Các tùy chọn khác...
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            extractCSS: true
          }
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin("style.css")
    ]
  }
  ```

  Hoặc truyền vào một instance của plugin:

  ``` js
  // webpack.config.js
  var ExtractTextPlugin = require("extract-text-webpack-plugin")
  var plugin = new ExtractTextPlugin("style.css")

  module.exports = {
    // Các tùy chọn khác...
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            extractCSS: plugin
          }
        }
      ]
    },
    plugins: [
      plugin
    ]
  }
  ```

### optimizeSSR

> Được giới thiệu từ phiên bản 12.1.1

- Kiểu: `boolean`
- Mặc định: `true` khi webpack được cấu hình `target: 'node'` và phiên bản `vue-template-compiler` từ 2.4.0 trở lên.

  Cho phép tối ưu biên dịch Vue 2.4 SSR nhằm biên dịch một phần cây DOM ảo trả về từ các hàm render thành một chuỗi HTML thuần túy, cải thiện hiệu năng SSR. Trong một số trường hợp bạn cần tắt nó đi vì kết xuất chỉ có thể sử dụng trên SSR và không thể sử dụng để render phía client hoặc kiểm thử.

### hotReload

> Được giới thiệu từ phiên bản 13.5.0

- Kiểu: `boolean`
- Mặc định: `true` trong chế độ development, `false` trong chế độ production hoặc webpack được cấu hình `target: 'node'`.
- Giá trị được phép sử dụng: `false` (`true` không hữu dụng trong chế độ production hoặc `target: 'node'`)

  Cho phép sử dụng webpack [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) để cập nhật nội dung trên trình duyệt **mà không cần tải lại trang**.
  Sử dụng tùy chọn này (với giá trị là `false`) to disable the Hot Reload feature in development mode.

### threadMode

> Được giới thiệu từ phiên bản 14.2.0

- Kiểu: `boolean`
- Mặc định: `false`

  Cài đặt giá trị là `true` cho phép cấu hình hệ thống tệp tin lưu trữ cache nhằm chia sẻ cấu hình của `vue-loader` với các loader con trong các tiến trình (thread) khác.

  Tùy chọn chỉ hữu dụng khi sử dụng với HappyPack hoặc `thread-loader`.
