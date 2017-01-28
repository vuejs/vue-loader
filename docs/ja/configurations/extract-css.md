# CSSを単一のファイルに抽出する

すべてのVueコンポーネントで処理されたすべてのCSSを1つのCSSファイルに抽出する例：

### Webpack 1.x

``` bash
npm install extract-text-webpack-plugin --save-dev
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // ほかのオプション
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
      // <style lang = "less">または他の言語も含めることができます
      less: ExtractTextPlugin.extract("css!less")
    }
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

### Webpack 2.x (^2.1.0-beta.25)

``` bash
npm install extract-text-webpack-plugin@2.x --save-dev
```

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
              loader: 'css-loader',
              fallbackLoader: 'vue-style-loader' // <- これはvue-loaderの依存ですので、npm3を使用している場合は明示的にインストールする必要はありません
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
