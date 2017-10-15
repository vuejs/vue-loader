# Extraindo CSS em um único arquivo

```bash
npm install extract-text-webpack-plugin --save-dev
```

## O caminho fácil

> Requer vue-loader@^12.0.0 e webpack@^2.0.0

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

A definição acima tratar automaticamente a extração para `<style>` dentro dos arquivos `* .vue` e funciona com a maioria dos pré-processadores pronto para uso.

Observe que isso apenas extrai arquivos `* .vue` - CSS importado em JavaScript ainda precisa ser configurado separadamente.

## Configuração Manual

Exemplo de configuração para extrair todos os CSS processados ​​em todos os componentes do Vue em um único arquivo CSS:

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
