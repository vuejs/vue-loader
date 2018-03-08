# Статические анализаторы

Вы, возможно, гадаете, как же прогонять код в `*.vue` файлах через статические анализаторы, поскольку это не JavaScript. Мы предполагаем, что вы используете [ESLint](https://eslint.org/) (если нет, настоятельно рекомендуем!).

Вам также понадобится официальный [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue), который поддерживает анализа шаблона и скриптов в `*.vue` файлах.

Убедитесь, что используете поставляемую с плагином конфигурацию в вашей конфигурации ESLint:

``` json
{
  "extends": [
    "plugin:vue/essential"
  ]
}
```

Убедитесь, что он применяется как предварительный загрузчик:

``` js
// webpack.config.js
module.exports = {
  // ... прочие опции
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
