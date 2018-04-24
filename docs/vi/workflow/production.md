# Production Build

Trong quá trình biên dịch bundle ở chế độ production, có hai tác vụ cần phải thực hiện:

1. Nén nhỏ toàn bộ mã nguồn ứng dụng;
2. Sử dụng [cài đặt được mô tả trong Vue.js](https://vuejs.org/guide/deployment.html) để loại bỏ các cảnh báo của mã nguồn Vue.js (vốn chỉ hữu dụng trong chế độ development)

Dưới đây là một cấu hình ví dụ:

``` js
// webpack.config.js
module.exports = {
  // ... Các tùy chọn khác
  plugins: [
    // short-circuits all Vue.js warning code
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // Nén nhỏ, loại bỏ các đoạn mã-nguồn-chết
    new webpack.optimize.UglifyJsPlugin()
  ]
}
```

Đoạn cấu hình này không nên sử dụng trong chế độ development, giải pháp trong trường hợp đó sẽ là như sau:

1. Xây dựng các đối tượng cấu hình với giá trị phụ thuộc vào biến môi trường;

2. Hoặc sử dụng hai tệp cấu hình riêng biệt, một cho development và tệp còn lại cho production. Có thể sử dụng một tệp cấu hình thứ ba để chia sẻ các cấu hình chung giữa hai tệp trên, ví dụ như [vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0).
