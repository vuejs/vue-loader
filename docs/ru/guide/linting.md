# Статический анализ кода

## ESLint

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
## stylelint

[stylelint](https://stylelint.io) supports linting style parts of Vue single file components.

[Make sure that your stylelint config is right.](https://stylelint.io/user-guide/configuration/)

Затем в командной строке:

``` bash
stylelint MyComponent.vue
```

Другим вариантом использования будет [stylelint-webpack-plugin](https://github.com/webpack-contrib/stylelint-webpack-plugin):

``` bash
npm install -D stylelint-webpack-plugin
```

Make sure it's applied as a plugin:

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
