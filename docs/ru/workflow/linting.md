# Статические анализаторы

Вы, возможно, гадаете, как же прогонять код в `*.vue` файлах через статические анализаторы, поскольку это не JavaScript. Мы предполагаем, что вы используете [ESLint](http://eslint.org/) (если нет, настоятельно рекомендуем!).

Вам также понадобится [eslint-html-plugin](https://github.com/BenoitZugmeyer/eslint-plugin-html) с поддержкой извлечения и анализа JavaScript в `*.vue` файлах.

Убедитесь в том, что вы добавили плагин в конфигурацию ESLint:

``` json
"plugins": [
  "html"
]
```

Затем в командной строке:

``` bash
eslint --ext js,vue MyComponent.vue
```

Другой вариант – использовать [eslint-loader](https://github.com/MoOx/eslint-loader), который будет автоматически анализировать `*.vue` файлы после сохранения во время разработки:

``` bash
npm install eslint eslint-loader --save-dev
```

``` js
// webpack.config.js
module.exports = {
  // ... прочие опции
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue!eslint'
      }
    ]
  }
}
```

Обратите внимание, что загрузчики Webpack применяются **справа-налево**. Убедитесь, что `eslint` прописан перед `vue`, чтобы код сначала проходил через анализатор, а затем компилировался.

Стоит упомянуть об использовании сторонних `*.vue` компонентов, поставляемых в NPM пакетах. В таком случае нам нужно воспользоваться `vue-loader`? чтобы подключить сторонние компоненты, но не анализировать их. Мы можем вынести анализ в [предзагрузчики](https://webpack.github.io/docs/loaders.html#loader-order) Webpack:

``` js
// webpack.config.js
module.exports = {
  // ... прочие опции
  module: {
    // анализировать только локальные *.vue файлы
    preLoaders: [
      {
        test: /\.vue$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    // но использовать vue-loader для всех *.vue файлов
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  }
}
```

Для Webpack 2.x:

``` js
// webpack.config.js
module.exports = {
  // ... прочие опции
  module: {
    rules: [
      // анализировать только локальные *.vue файлы
      {
        enforce: 'pre',
        test: /\.vue$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      // но использовать vue-loader для всех *.vue файлов
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
}
```
