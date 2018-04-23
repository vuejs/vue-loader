# PostCSS

Mã nguồn CSS sau khi được xử lý bởi `vue-loader` sẽ được tiếp tục xử lý bởi [PostCSS](https://github.com/postcss/postcss) nhằm viết lại CSS scoped. Bạn cũng có thể thêm các PostCSS plugin khác cho quá trình xử lý này, ví dụ như [autoprefixer](https://github.com/postcss/autoprefixer) hoặc [CSSNext](http://cssnext.io/).

## Sử dụng tệp cấu hình

`vue-loader` hỗ trợ các tệp cấu hình PostCss tự động giống hệt [`postcss-loader`](https://github.com/postcss/postcss-loader#usage):

- `postcss.config.js`
- `.postcssrc`
- `postcss` field in `package.json`

Sử dụng tệp cấu hình cho phép bạn chia sẻ cùng cấu hình giữa các tệp mã nguồn CSS thông thường, vốn được xử lý bởi `postcss-loader` và mã nguồn CSS bên trong tệp `*.vue`. Chúng tôi khuyến khích bạn thực hiện cách thức cấu hình này.

## Sử dụng với `postcss-loader`

Bởi vì `vue-loader` chỉ sử dụng PostCSS cho các khối style bên trong các tệp `*.vue`, `postcss-loader` sẽ được xử dụng để xử lý các tệp CSS độc lập. Không cần chỉ rõ `lang="postcss"` bên trong khối style nếu tệp cấu hình PostCss đã tồn tại trong dự án.

Đôi khi bạn cần sử dụng `lang="postcss"` nhằm mục đích hỗ trợ IDE tô màu mã nguồn (syntax highlighting). Kể từ phiên bản `vue-loader` 13.6.0, nếu không có loader nào được cấu hình tường minh cho những extension thông dụng của PostCSS (via `vue-loader`'s own `loaders` option), các transform mặc định sau của PostCSS sẽ được `vue-loader` sử dụng:

- `postcss`
- `pcss`
- `sugarss`
- `sss`

## Inline Options

Thay vào đó, bạn có thể chỉ rõ cấu hình PostCSS vốn chỉ áp dụng riêng cho các tệp `*.vue` bằng cách sử dụng tùy chọn `postcss` cho `vue-loader`.

Ví dụ:

``` js
// webpack.config.js
module.exports = {
  // Các tùy chọn khác...
  module: {
    // `module.rules` ở phiên bản Webpack 2.x giống hệt `module.loaders` ở phiên bản 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // cấu hình `vue-loader` ở đây
        options: {
          // ...
          postcss: [require('postcss-cssnext')()]
        }
      }
    ]
  }
}
```

Ngoài việc cung cấp một mảng các plugin như trên, tùy chọn `postcss` cũng có thể nhận:

- Một hàm trả về mảng các plugin;

- Một đối tượng chứa các tùy chọn to be passed to the PostCSS processor. Điều này rất hữu ích khi trong một dự án PostCSS sử dụng các bộ phân tích cú pháp/biến đổi chuỗi tùy biến.:

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: 'sugarss' // use sugarss parser
    }
  }
  ```

### Vô hiệu hóa tệp cấu hình tự động

Trong phiên bản `13.6.0+`, tệp cấu hình PostCSS tự động có thể bị vô hiệu hóa bằng cách chỉ định `postcss.useConfigFile: false`:

``` js
postcss: {
  useConfigFile: false,
  plugins: [/* ... */],
  options: {/* ... */}
}
```

Điều này cho phép cấu hình PostCSS bên trong các tệp `*.vue` được kiểm soát hoàn toàn bởi inline config.
