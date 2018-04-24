# Sử dụng tiền-xử-lý

Trong webpack, quá trình tiền-xử-lý cần phải được áp dụng với loader tương ứng. thuộc tính `vue-loader` allows you to use other webpack loaders to process a part of a Vue component. It will automatically infer the proper loaders to use from the `lang` of a language block.

### CSS

Ví dụ, hãy biên dịch khối `<style>` sau được viết bằng Sass:

``` bash
npm install sass-loader node-sass --save-dev
```

``` html
<style lang="sass">
  /* viết mã nguồn SASS ở đây */
</style>
```

Mã nguồn bên trong khối `<style>` sẽ được biên dịch trước tiên bởi `sass-loader` trước khi truyền đến các quá trình xử lý phù hợp khác.

#### Chú ý với sass-loader

Trái ngược với cái tên của mình, [*sass*-loader](https://github.com/jtangelder/sass-loader) mặc định sẽ xử lý cú pháp *SCSS*. Trường hợp bạn thực sự muốn sử dụng cú pháp thụt lề của *Sass*, bạn cần cấu hình tường minh tùy chọn của vue-loader cho phần sass-loader như dưới đây.

```javascript
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
      sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
    }
  }
}
```

Xem thêm phần [Cấu hình Loader nâng cao](./advanced.md) để biết thêm cách thức cấu hình vue-loader.

#### Load một tệp cài đặt toàn cục

Một yêu cầu phổ biến là có thể tải tệp cài đặt trong mỗi component mà không cần phải lặp đi lặp lại thao tác import, ví dụ như sử dụng các biến/mixins toàn cục của scss trên toàn bộ các all components. Để thực hiện được điều đó chúng ta làm như sau:

``` bash
npm install sass-resources-loader --save-dev
```

Thêm vào tệp cấu hình webpack đoạn mã sau:

``` js
{
  loader: 'sass-resources-loader',
  options: {
    resources: path.resolve(__dirname, '../src/style/_variables.scss')
  }
}
```

Một ví dụ nữa, nếu bạn xây dựng dự án từ [vuejs-templates/webpack](https://github.com/vuejs-templates/webpack), chỉnh sửa `build/utils.js` như sau:

``` js
scss: generateLoaders('sass').concat(
  {
    loader: 'sass-resources-loader',
    options: {
      resources: path.resolve(__dirname, '../src/style/_variables.scss')
    }
  }
),
```

Chỉ nên thực hiện điều này với các tệp chứa biến hoặc mixins toàn cục và không chứa selector có thể biên dịch thành CSS được, nhằm tránh hiện tượng mã nguồn CSS bị lặp lại nhiều lần ở tệp kết xuất.

### JavaScript

Toàn bộ mã nguồn Javascript bên trong Vue component được xử lý mặc định bởi `babel-loader`. Tuy nhiên nếu bạn sử dụng ngôn ngữ khác ví dụ như `CoffeeScript`, bạn có thể thay đổi bằng cách cài đặt gói loader tương ứng, và thêm thuộc tính ngôn ngữ cho khối `<script>`:

``` bash
npm install coffee-loader --save-dev
```

``` html
<script lang="coffee">
  # Write coffeescript!
</script>
```

### Templates

Có một chút khác biệt khi xử lý template, bởi phần nhiều các template loader của webpack ví dụ như `pug-loader` trả về một hàm biên dịch template thay vì một chuỗi HTML string đã được biên dịch. Thay vì sử dụng `pug-loader`, chúng ta chỉ cần cài đặt gói `pug` là đủ:

``` bash
npm install pug --save-dev
```

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

> **Ghi nhớ quan trọng:** Nếu bạn sử dụng `vue-loader@<8.2.0`, bạn cần phải cài đặt `template-html-loader`.

### Truy vấn Inline Loader

Bạn có thể sử dụng [webpack loader requests](https://webpack.github.io/docs/loaders.html#introduction) bên trong thuộc tính `lang`:

``` html
<style lang="sass?outputStyle=expanded">
  /* use sass here with expanded output */
</style>
```

Tuy nhiên, thao tác trên chỉ tương thích với webpack và không hề tương thích với Browserify [vueify](https://github.com/vuejs/vueify). **Nếu bạn có ý định tái sử dụng Vue component, ví dụ như viết plugin cho ứng dụng khác, tránh sử dụng cú pháp này.**
