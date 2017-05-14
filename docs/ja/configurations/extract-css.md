# CSS を単一のファイルに抽出する

``` bash
npm install extract-text-webpack-plugin --save-dev
```

## The Easy Way

> requires vue-loader@^12.0.0 and webpack@^2.0.0

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // other options...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: true
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

The above will automatically handle extraction for `<style>` inside `*.vue` files and works with most pre-processors out of the box.

Note this only extracts `*.vue` files though - CSS imported in JavaScript still needs to be configured separately.

## Manual Configuration

すべての Vue コンポーネントで処理されたすべての CSS を 1 つの CSS ファイルに抽出する例:

### Webpack 2.x

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // 他の設定
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'vue-style-loader' // <- これは vue-loader の依存ですので、npm3 を使用している場合は明示的にインストールする必要はありません
            })
          }
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

### Webpack 1.x

``` bash
npm install extract-text-webpack-plugin --save-dev
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // 他の設定
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
    ]
  },
  vue: {
    loaders: {
      css: ExtractTextPlugin.extract("css"),
      // <style lang="less">　または他の言語も含めることができます
      less: ExtractTextPlugin.extract("css!less")
    }
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```
