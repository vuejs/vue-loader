# 代码检验

你可能有疑问，在 `.vue` 文件中你怎么检验你的代码，因为它不是 JavaScript。我们假设你使用 [ESLint](https://eslint.org/) (如果你没有使用话，你应该去使用！)。

你还需要官方的 [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)，它同时支持检验你 `.vue` 文件中的模板和脚本。

请确保在你的 ESLint 配置中使用了该插件自身的配置：

``` json
{
  "extends": [
    "plugin:vue/essential"
  ]
}
```

在命令行这样使用：

``` bash
eslint --ext js,vue MyComponent.vue
```

别一种方法是使用 [eslint-loader](https://github.com/MoOx/eslint-loader)，这样你的 `.vue` 文件会在开发期间每次保存时自动检验。

``` bash
npm install eslint eslint-loader --save-dev
```

请确保它应用在了 pre-loader 上：

``` js
// webpack.config.js
module.exports = {
  // ... other options
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  }
}
```
