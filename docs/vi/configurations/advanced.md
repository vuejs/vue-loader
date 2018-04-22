# Cấu hình loader nâng cao

Thỉnh thoảng bạn có những nhu cầu sau:

1. Thay đổi dãy loader cho một ngôn ngữ nào đó thay vì để cho `vue-loader` mặc định tự quyết định;

2. Ghi đè cấu hình loader mặc định cho những ngôn ngữ mặc định;

3. Tiền-xử-lý hoặc hậu-xử-lý một khối ngôn ngữ nào đó với dãy loader do bạn tự chỉ định.

Để thực hiện những nhu cầu trên, chỉ rõ tùy chọn `loaders` cho `vue-loader`:

> Lưu ý rằng `preLoaders` và `postLoaders` chỉ hỗ trợ trên phiên bản 10.3.0+ về sau

``` js
module.exports = {
  // Các tùy chọn khác...
  module: {
    // `module.rules` ở phiên bản Webpack 2.x giống hệt `module.loaders` ở phiên bản 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `loaders` will overwrite the default loaders.
          // The following config will cause all `<script>` tags without `lang`
          // attribute to be loaded with `coffee-loader`
          loaders: {
            js: 'coffee-loader'
          },

          // `preLoaders` are attached before the default loaders.
          // You can use this to pre-process language blocks - a common use
          // case would be build-time i18n.
          preLoaders: {
            js: '/path/to/custom/loader'
          },

          // `postLoaders` are attached after the default loaders.
          //
          // - For `html`, the result returned by the default loader
          //   will be compiled JavaScript render function code.
          //
          // - For `css`, the result will be returned by `vue-style-loader`
          //   which isn't particularly useful in most cases. Using a PostCSS
          //   plugin will be a better option.
          postLoaders: {
            html: 'babel-loader'
          },

          // `excludedPreLoaders` should be regex
          excludedPreLoaders: /(eslint-loader)/
        }
      }
    ]
  }
}
```

Một ví dụ cụ thể hơn của việc cấu hình loader nâng cao là [bóc tách CSS bên trong các tệp component thành một file](./extract-css.md).
