# Linting

The official [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue) supports linting both the template and script parts of Vue single file components.

Make sure to use the plugin's included config in your ESLint config:

``` js
// .eslintrc.js
module.exports = {
  extends: [
    "plugin:vue/essential"
  ]
}
```

Then from the command line:

``` bash
eslint --ext js,vue MyComponent.vue
```

Another option is using [eslint-loader](https://github.com/MoOx/eslint-loader) so that your `*.vue` files are automatically linted on save during development:

``` bash
npm install -D eslint eslint-loader
```

Make sure it's applied as a pre-loader:

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
