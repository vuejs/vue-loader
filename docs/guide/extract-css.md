# CSS Extraction

::: tip
Only apply CSS extraction for production so that you get CSS hot reload during development.
:::

## webpack 4

``` bash
npm install -D mini-css-extract-plugin
```

``` js
// webpack.config.js
var MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  // other options...
  module: {
    rules: [
      // ... other rules omitted
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'vue-style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // ... Vue Loader plugin omitted
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ]
}
```

Also see [mini-css-extract-plugin docs](https://github.com/webpack-contrib/mini-css-extract-plugin).

## webpack 3

``` bash
npm install -D extract-text-webpack-plugin
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // other options...
  module: {
    rules: [
      // ... other rules omitted
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader',
          fallback: 'vue-style-loader'
        })
      }
    ]
  },
  plugins: [
    // ... Vue Loader plugin omitted
    new ExtractTextPlugin("style.css")
  ]
}
```

Also see [extract-text-webpack-plugin docs](https://github.com/webpack-contrib/extract-text-webpack-plugin).
