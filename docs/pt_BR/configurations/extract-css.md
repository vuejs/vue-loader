# Extraindo CSS em um único arquivo

Exemplo de configuração para extrair todo CSS processado de todos componentes Vue em um único arquivo CSS:

### Webpack 2.x

```bash
npm install extract-text-webpack-plugin@2.x --save-dev
```

```js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // outras opções...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              loader: 'css-loader',
              fallbackLoader: 'vue-style-loader' // <- isto é uma dependência de vue-loader, então não é necessário instalar explicitamente se estiver usando npm3
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

```bash
npm install extract-text-webpack-plugin
```

```js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // outras opções...
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
      // você também pode incluir <style lang="less"> ou outras linguagens
      less: ExtractTextPlugin.extract("css!less")
    }
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```