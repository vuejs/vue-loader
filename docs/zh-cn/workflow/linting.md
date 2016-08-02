# 检查代码

你可能已经在怀疑，怎么在 `*.vue` 文件里面检测代码，毕竟它们不是 JavaScript。我们假设你正在使用 [ESLint](http://eslint.org/)（如果你没用，你该用了！）。

你还需要 [eslint-html-plugin](https://github.com/BenoitZugmeyer/eslint-plugin-html) 插件，用来提取和检测 `*.vue` 文件中的 JavaScript。

确保在 ESLint 配置中引入这个插件：

``` json
"plugins": [
  "html"
]
```

然后在命令行运行：

``` bash
eslint --ext js,vue MyComponent.vue
```

另一种选择是使用 [eslint-loader](https://github.com/MoOx/eslint-loader)，这样，在开发阶段，当你在保存 `*.vue` 文件时，会自动检测代码。

``` bash
npm install eslint eslint-loader --save-dev
```

``` js
// webpack.config.js
module.exports = {
  // ... other options
  module: {
    loaders: [
      {
        test: /.vue$/,
        loader: 'vue!eslint'
      }
    ]
  }
}
```

注意，Webpack loader 的调用顺序是 **靠右优先** 执行。要确保 `eslint` 在 `vue` 前面执行，这样我们检测的才是编译前的源码。

有一件事需要多加考虑，就是使用第三方 NPM 包中的 `*.vue` 组件。在这种情况下，我们要使用 `vue-loader` 去处理第三方组件，但是不想检查它的代码。我们可以把检测隔开，放到 Webpack 的
[preLoaders](https://webpack.github.io/docs/loaders.html#loader-order)：

``` js
// webpack.config.js
module.exports = {
  // ... other options
  module: {
    // 只检查本地 *.vue 文件的代码
    preLoaders: [
      {
        test: /.vue$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    // 对所有 *.vue 文件使用 vue-loader
    loaders: [
      {
        test: /.vue$/,
        loader: 'vue'
      }
    ]
  }
}
```
