# Linting

You may have been wondering how do you lint your code inside `*.vue` files, since they are not JavaScript. We will assume you are using [ESLint](http://eslint.org/) (if you are not, you should!).

When using ESLint directly, you can use it with the [eslint-html-plugin](https://github.com/BenoitZugmeyer/eslint-plugin-html) with also supports extracting and linting the JavaScript inside `*.vue` files.

Another option is using the [eslint-loader](https://github.com/MoOx/eslint-loader), and configure it to lint the JavaScript code in `*.vue` files directly:

``` bash
npm install eslint eslint-loader --save-dev
```

``` js
// webpack.config.js
module.exports = {
  // ... other options
  vue: {
    loaders: {
      js: 'babel!eslint'
    }
  },
  babel: {
    presets: ['es2015'],
    plugins: ['transform-runtime']
  }
}
```

Two things to note here:

1. We are overwriting the default loader string for all JavaScript in `*.vue` files - if we still want ES2015, we need to explicitly apply `babel-loader` and related configurations.

2. Webpack loader chains are applied right-first. Make sure to apply `eslint` before `babel` so we are linting the pre-compile source code.

And don't forget to create your `.eslintrc` config. Now when you run `webpack-dev-server`, you'll get instant lint warnings as you save the file!
