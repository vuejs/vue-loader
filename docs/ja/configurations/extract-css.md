# CSS を単一のファイルに抽出する

``` bash
npm install extract-text-webpack-plugin --save-dev
```

## 簡単な方法

> vue-loader@^12.0.0 と webpack@^2.0.0 必須

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // 他のオプション...
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

上記は、`*.vue` ファイル内部の `<style>` のための抽出を自動的に処理し、ほとんどのプリプロセッサでそのまま使えます。

これは、`*.vue` ファイルだけを抽出することに注意してください。JavaScript でインポートされた CSS は、別途設定する必要があります。

## 手動設定

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
