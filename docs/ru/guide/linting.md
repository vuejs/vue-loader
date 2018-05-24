# Статический анализ кода

Официальный плагин [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue) поддерживает проверку секций шаблона и кода в однофайловых компонентах Vue.

Убедитесь, что используете поставляемую с плагином конфигурацию в вашей конфигурации ESLint:

``` js
// .eslintrc.js
module.exports = {
  extends: [
    "plugin:vue/essential"
  ]
}
```

Затем в командной строке:

``` bash
eslint --ext js,vue MyComponent.vue
```

Другим вариантом использования будет [eslint-loader](https://github.com/MoOx/eslint-loader), что позволит проверять ваши `*.vue` файлы автоматически при сохранении на этапе разработки:

``` bash
npm install -D eslint eslint-loader
```

Убедитесь, что он применяется как предварительный загрузчик:

``` js
// webpack.config.js
module.exports = {
  // ... другие настройки
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
