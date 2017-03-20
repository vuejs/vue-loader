# 代码检验

你可能有疑问，在 `.vue` 文件中你怎么检验你的代码，因为它不是 Javascript。我们假设你使用 [ESLint](http://eslint.org/) (如果你没有使用话，你应该去使用！)。

你需要 [eslint-plugin-html](https://github.com/BenoitZugmeyer/eslint-plugin-html) 来支持提取并检验你的 `.vue` 文件中的 JavaScript。

确保把下面的配置加入到你的 ESLint 配置中：
``` json
"plugins": [
  "html"
]
```

在命令行这样使用：

``` bash
eslint --ext js,vue MyComponent.vue
```

别一种方法是使用 [eslint-loader](https://github.com/MoOx/eslint-loader),这样你的 `.vue` 文件在开发期间每次保存时会自动检验。

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

注意 Webpack loader 处理顺序是 **从右到左**。确保在 `vue` 之前应用 `eslint`，这样我样才能检验编译前的代码。

我们需要考虑使用的 NPM 包中的第三方 `.vue` 组件，实际使用中我们希望使用 `vue-loader` 去处理第三方组件，但是不想检验它们。我们需要把 linting 配置到 Webpack's [preLoaders](https://webpack.github.io/docs/loaders.html#loader-order)中：

``` js
// webpack.config.js
module.exports = {
  // ... other options
  module: {
    // only lint local *.vue files
    preLoaders: [
      {
        test: /.vue$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    // but use vue-loader for all *.vue files
    loaders: [
      {
        test: /.vue$/,
        loader: 'vue'
      }
    ]
  }
}
```

For Webpack 2.x:

``` js
// webpack.config.js
module.exports = {
  // ... other options
  module: {
    rules: [
      // only lint local *.vue files
      {
        enforce: 'pre',
        test: /.vue$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      // but use vue-loader for all *.vue files
      {
        test: /.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
}
```
