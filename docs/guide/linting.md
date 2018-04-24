# Linting

You may have been wondering how do you lint your code inside `*.vue` files, since they are not JavaScript. We will assume you are using [ESLint](https://eslint.org/) (if you are not, you should!).

You will also need the official [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue) which supports linting both the template and script parts of Vue files.

Make sure to use the plugin's included config in your ESLint config:

``` json
{
  "extends": [
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
npm install eslint eslint-loader --save-dev
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
