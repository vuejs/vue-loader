# Статический анализ кода

## ESLint

Официальный плагин [eslint-plugin-vue](https://eslint.vuejs.org/) поддерживает проверку секций шаблона и кода в однофайловых компонентах Vue.

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
## stylelint

[stylelint](https://stylelint.io) поддерживает проверку секций стилей в однофайловых компонентах Vue.

[Убедитесь, что ваша конфигурация stylelint корректна.](https://stylelint.io/user-guide/configuration/)

Затем выполните в командной строке:

``` bash
stylelint MyComponent.vue
```

Вы также можете использовать плагин [stylelint-webpack-plugin](https://github.com/webpack-contrib/stylelint-webpack-plugin):

``` bash
npm install -D stylelint-webpack-plugin
```

Убедитесь, что добавили плагин в конфигурацию:

``` js
// webpack.config.js
const StyleLintPlugin = require('stylelint-webpack-plugin');
module.exports = {
  // ... другие настройки
  plugins: [
    new StyleLintPlugin({
      files: ['**/*.{vue,htm,html,css,sss,less,scss,sass}'],
    })
  ]
}
```
