# Hot Reload

"Hot Reload" không làm cho trình duyệt tải lại toàn bộ trang web khi bạn chỉnh sửa mã nguồn. Với tính năng "hot-reload", khi bạn thực hiện chỉnh sửa một tệp `*.vue`, mọi đối tượng của component đó sẽ được thay đổi theo chỉnh sửa của bạn trực tiếp trên trình duyệt **mà không cần tải lại toàn bộ trang web**. It even preserves the current state of your app and these swapped components! This dramatically improves the development experience when you are tweaking the templates or styling of your components.

![hot-reload](http://blog.evanyou.me/images/vue-hot.gif)

## Các quy tắc giữ nguyên trạng thái cho component

- Khi chỉnh sửa khối `<template>` của một component, instances of the edited component will re-render in place, preserving all current private state. This is possible because templates are compiled into new render functions that produce no side-effects.

- When editing the `<script>` part of a component, instances of the edited component will be destroyed and re-created in place. (State of the other components in the app are preserved) This is because `<script>` can include lifecycle hooks that may produce side-effects, so a "reload" instead of re-render is required to ensure consistent behavior. This also means you need to be careful about global side effects such as timers inside your components lifecycle hooks. Sometimes you may need to do a full-page reload if your component produces global side-effects.

- `<style>` hot reload operates on its own via `vue-style-loader`, so it doesn't affect application state.

## Usage

When scaffolding the project with `vue-cli`, Hot Reload is enabled out-of-the-box.

When manually setting up your project, hot-reload is enabled automatically when you serve your project with `webpack-dev-server --hot`.

Advanced users may want to check out [vue-hot-reload-api](https://github.com/vuejs/vue-hot-reload-api), which is used internally by `vue-loader`.

## Disabling Hot Reload

Hot Reload is always enabled except following situations:

 * webpack `target` is `node` (SSR)
 * webpack minifies the code
 * `process.env.NODE_ENV === 'production'`

You may use `hotReload: false` option to disable the Hot Reload explicitly:

``` js
module: {
  rules: [
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        hotReload: false // disables Hot Reload
      }
    }
  ]
}
```
