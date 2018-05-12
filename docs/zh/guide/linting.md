# 代码校验 (Linting)

官方的 [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue) 同时支持在 Vue 单文件组件的模板和脚本部分的代码校验。

请确认在你的 ESLint 配置文件中使用该插件要导入的配置：

``` js
// .eslintrc.js
module.exports = {
  extends: [
    "plugin:vue/essential"
  ]
}
```

接下来从命令行运行：

``` bash
eslint --ext js,vue MyComponent.vue
```

另一个选项是使用 [eslint-loader](https://github.com/MoOx/eslint-loader) 那么你的 `*.vue` 文件在开发过程中每次保存的时候就会自动进行代码校验：

``` bash
npm install -D eslint eslint-loader
```

请确保它是作为一个 pre-loader 运用的：

``` js
// webpack.config.js
module.exports = {
  // ... 其它选项
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
