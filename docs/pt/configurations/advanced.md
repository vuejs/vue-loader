# Configurações avançadas do carregador

Às vezes você pode querer aplicar um carregador de string a uma linguagem em vez de deixar `vue-loader` responsável. Ou você pode simplesmente querer sobrescrever a configuração embutida do carregador para a linguagem padrão. Para fazer isso, adicione um bloco `vue` em seu arquivo de configuração Webpack, e especifique a opção `loaders`.

### Webpack 1.x

```js
// webpack.config.js
module.exports = {
  // outras opções...
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  },
  // configurações vue-loader 
  vue: {
    // ... outras opções vue
    loaders: {
      // carrega todo <script> sem o atributo "lang" com coffee-loader
      js: 'coffee',
      // carrega <template> diretamente como string HTML, 
      // canalizá-lo atravé de vue-html-loader primeiro
      html: 'raw'
    }
  }
}
```

### Webpack 2.x \(^2.1.0-beta.25\)

```js
module.exports = {
  // outras opções...
  module: {
    // module.rules é o mesmo que module.loaders em 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // opções de vue-loader
        options: {
          loaders: {
            // ...
          }
        }
      }
    ]
  }
}
```

Um uso mais prático das configurações avançadas do carregador é [extrair o CSS do componente em um único arquivo](./extract-css.md).