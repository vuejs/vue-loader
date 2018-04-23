# Phân tách CSS thành các file

``` bash
npm install extract-text-webpack-plugin --save-dev
```

## Cách đơn giản

> Yêu cầu phiên bản vue-loader@^12.0.0 và webpack@^2.0.0

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // các tùy chọn khác...
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

Đoạn cấu hình trên tự động xử lý việc bóc tách mã nguồn CSS bên trong các khối `<style>` của các tệp `*.vue` và hoạt động với các bộ tiền-xử-lý out of the box.

Lưu ý rằng tùy chọn này chỉ hỗ trợ bóc tách bên trong các tệp `*.vue` - CSS được import bên trong JavaScript vẫn phải được cấu hình riêng biệt.

## Cấu hình bằng tay

Một ví dụ cấu hình nhằm bóc tách toàn bộ các CSS bên trong mọi Vue component thành một tệp CSS duy nhất:

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
          loaders: {
            css: ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'vue-style-loader' // <- this is a dep of vue-loader, so no need to explicitly install if using npm3
            })
          }
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```
