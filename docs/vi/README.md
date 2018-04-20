# Giới thiệu

### Vue Loader là gì?

`vue-loader` là một loader sử dụng trên webpack, cho phép biến đổi Vue component được viết với định dạng đặc biệt được mô tả như dưới đây thành một JavaScript module thuần túy:

![screenshot](http://blog.evanyou.me/images/vue-component.png)

 `vue-loader` sở hữu rất nhiều tính năng thú vị:

- ES2015 được hỗ trợ mặc định;
- Cho phép sử dụng nhiều loader khác nhau cho mỗi phần của Vue component, ví dụ như `sass-loader` cho thẻ `<style>` and Jade (`pug-loader`) cho thẻ `<template>`;
- Cho phép mỗi phần trên tệp tin `.vue` được transpile bởi một dãy các loader tùy biến được.
- Trích xuất các tệp tài nguyên tĩnh được sử dụng trong `<style>` và `<template>` như là các module dependency và xử lý chúng với webpack loaders;
- Hỗ trợ scoped CSS cho mỗi component;
- Hỗ trợ tính năng hot-reloading cho các component trong suốt quá trình phát triển ứng dụng.

Tóm tắt lại, với sự kết hợp của webpack và `vue-loader`, chúng ta đã có một quy trình viết mã nguồn hiện đại, linh hoạt và đầy sức mạnh cho việc phát triển ứng dụng Vue.js

### Webpack là gì?

Bạn có thể bỏ qua phần giải thích này đi nếu đã quá quen thuộc với webpack. Trường hợp bạn là "lính mới" đang bỡ ngỡ tự hỏi webpack là cái gì, phần này sẽ giải thích và giới thiệu sơ lược cho bạn:

[webpack](https://webpack.github.io/) là một **module bundler** (công cụ build các thư viện Javascript). Nhiệm vụ của webpack là tiếp nhận tất cả các tệp tin mã nguồn có liên quan và xử lý chúng dưới dạng các module CommonJS, phân tích sự phụ thuộc giữa các module, và hợp nhất chúng thành một tập (bundle) các tài nguyên tĩnh (CSS, JS, ảnh, tệp tin font, ...) sử dụng để deployment ứng dụng.

![webpack](https://webpack.github.io/assets/what-is-webpack.png)

Một ví dụ đơn giản nhất là, tưởng tượng rằng mã nguồn của chúng ta gồm nhiều CommonJS module. CommonJS có thể thực thi trực tiếp trên môi trường NodeJS nhưng lại không thể trên trình duyệt, do đó, để thực thi được, ta cần phải có một công cụ để "đóng gói" chúng vào một tệp mã nguồn duy nhất để sử dụng thông qua `<script>` tag. Webpack theo dõi sự phụ thuộc giữa các module thông qua các hàm gọi `require()` để hiện thực nhiệm vụ đó.

Sức mạnh của webpack không chỉ dừng lại ở đó. Với cái gọi là "loaders", chúng ta có thể cấu hình lại webpack, cho phép webpack biến đổi mọi định dạng tệp tin theo bất cứ cách nào mà chúng ta muốn trước khi kết xuất thành một bundle cuối cùng. Một vài ví dụ:

- Thông dịch các modules viết bằng ES2015, CoffeeScript hoặc TypeScript thành các module ES5 CommonJS thuần túy;
- Một số loader cho phép chúng ta "lint" (kiểm tra quy chuẩn cú pháp) mã nguồn trước khi thực hiện việc thông dịch;
- Thông dịch mã nguồn HTML được viết dưới dạng Jade templates thành mã nguồn HTML thuần túy và inline nó thành một giá trị chuỗi JavaScript;
- Thông dịch mã nguồn Sass thành CSS, biến đổi nó thành một đoạn mã JS cho phép chèn CSS vào DOM dưới dạng thẻ `<style>` khi thực thi;
- Xử lý các tệp hình ảnh hoặc font được gọi đến trong HTML hoặc CSS, các tệp trên sau xử lý được lưu trữ ở thư mục đích được cấu hình từ trước bởi webpack configuration, và đổi tên chúng dựa vào mã MD5 của tệp tin.

webpack is so powerful that when you understand how it works, it can dramatically improve your front-end workflow. Its primary drawback is its verbose and complex configuration; but with this guide you should be able to find solutions for most common issues when using webpack with Vue.js and `vue-loader`.
