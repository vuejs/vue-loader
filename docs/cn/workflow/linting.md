# Linting

You may have been wondering how do you lint your code inside `*.vue` files, since they are not JavaScript. We will assume you are using [ESLint](http://eslint.org/) (if you are not, you should!).

You will also need the [eslint-html-plugin](https://github.com/BenoitZugmeyer/eslint-plugin-html) with supports extracting and linting the JavaScript inside `*.vue` files.

Make sure to include the plugin in your ESLint config:

``` json
"plugins": [
  "html"
]
```

Then from the command line:

``` bash
eslint --ext js,vue MyComponent.vue
```

Another option is using [eslint-loader](https://github.com/MoOx/eslint-loader) so that your `*.vue` files are automatically linted on save during development:

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

Note that Webpack loader chains are applied **right-first**. Make sure to apply `eslint` before `vue` so we are linting the pre-compile source code.

One thing we need to consider is using third party `*.vue` components shipped in NPM packages. In such case, we want to use `vue-loader` to process the third party component, but do not want to lint it. We can separate the linting into Webpack's [preLoaders](https://webpack.github.io/docs/loaders.html#loader-order):

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
