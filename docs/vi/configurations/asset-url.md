# Xử lý URL tài nguyên

Mặc định, `vue-loader` tự động xử lý style và template bên trong các tệp `*.vue` component bởi [css-loader](https://github.com/webpack/css-loader) và bộ biên dịch template của Vue. Trong quá trình biên dịch này, toàn bộ URL tài nguyên ví dụ như `<img src="...">`, `background: url(...)` và CSS `@import` đều được **xử lý như là các module phụ thuộc**.

Ví dụ như, `url(./image.png)` sẽ được thông dịch thành `require('./image.png')`, và

``` html
<img src="../image.png">
```

sẽ được biên dịch thành:

``` js
createElement('img', { attrs: { src: require('../image.png') }})
```

### Quy tắc biến đổi URL

- Nếu URL là một đường dẫn tuyệt đối (e.g. `/images/foo.png`), nó sẽ được giữ nguyên.

- Nếu URL bắt đầu với `.`, nó sẽ được diễn dịch thành một lệnh import module với đường dẫn tương đối và xử lý dựa trên cấu trúc thư mục của hệ thống.

- Nếu URL bắt đầu với `~`, mọi thứ phía sau nó sẽ được diễn dịch thành một lệnh import module. Điều đó có nghĩa, bạn có thể tham chiếu đến một tài nguyên tĩnh trong module thuộc node_modules:

  ``` html
  <img src="~some-npm-package/foo.png">
  ```

- (13.7.0+) Nếu URL bắt đầu với `@`, tương tự như trên, nó cũng sẽ được diễn dịch thành một lệnh import module. Điều này rất có ích nếu tệp cấu hình webpack của bạn cấu hình một bí danh (alias) `@` mặc định được trỏ đến thư mục `/src` của bất kì dự án nào được khởi tạo bởi `vue-cli`.

### Các loader có liên quan

Bởi vì `.png` không phải là một tệp mã nguồn JavaScript, bạn cần phải cấu hình webpack với [file-loader](https://github.com/webpack/file-loader) hoặc [url-loader](https://github.com/webpack/url-loader) để xử lý chúng. Tất nhiên việc cấu hình đó cũng đã được thực hiện sẵn luôn cho bạn nếu dự án được khởi tạo nhanh bằng `vue-cli`.

### Tại sao?

1. `file-loader` cho phép chúng ta chỉ định rõ nơi sao chép và lưu trữ tài nguyên tĩnh, cách thức đặt lại tên với version hash (mã băm phiên bản) cho hiệu quả lưu cache tốt hơn. Hơn thế nữa, điều đó cũng có nghĩa là **you can just place images next to your `*.vue` files and use relative paths based on the folder structure instead of worrying about deployment URLs**. Với cấu hình thích hợp, webpack sẽ tự động viết lại đường dẫn tệp thành những URLs hữu dụng trong kết xuất đã được bundle.

2. `url-loader` cho phép chúng ta inline nội dung của một tệp tài nguyên dưới dạng mã Base64-URL khi kích thước của chúng nhỏ hơn một giới hạn cho trước. Việc này giảm bớt số truy vấn HTTP vì có thể loại bớt truy vấn với những tài nguyên kích thước quá nhỏ. Ngược lại nếu kích thước tệp vượt quá giới hạn cho trước đó, `url-loader` sẽ bỏ qua và trả lại việc xử lý cho `file-loader`.
