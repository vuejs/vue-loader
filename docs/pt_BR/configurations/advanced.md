# Configurações avançadas do carregador

Às vezes você pode querer:

1. Aplicar um carregador personalizado de string a uma linguagem em vez de deixar `vue-loader` responsável. 

2. Sobrescrever a configuração embutida do carregador para a linguagem padrão. 

3. Pré-processar ou pós-processar um bloco de linguagem especifico com carregadores personalizado.

Para fazer isto, especifique a opção `loaders` para `vue-loader`:

> Observe que `preLoaders` e`postLoaders` são suportados apenas em verões >=10.3.0

### Webpack 2.x

```js
// webpack.config.js
module.exports = {
  // outras opções...
  module: {
    // module.rules é o mesmo que module.loaders em 1.x
    rules : [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `loaders` substituirá os carregadores padrões.
          // A configuração a seguir fará com que todas as tags <script> sem 
          // o atributo "lang" sejam carrega com coffee-loader
          loaders: {
            js: 'coffee-loader'
          },
          
          // `preLoaders` são anexados antes dos carregadores padrões
          // Você pode usar isso para pré-processar blocos de linguagem 
          // - um caso de uso comum seria intercionalização (i18n)  em tempo de construção.
          preLoaders: {
            js: '/caminho/personalizado/para/carregador'
          },
          
          // `postLoaders` são anexados após os carregadores padrões.
          // 
          // - Para `html`, o resultado retornado pelo carregador padrão
          //   será compilado em código de função de renderização JavaScript.
          //
          // - Para `css`, o resultado será retornado por vue-style-loader
          //   que não é particulamente útil em muitos casos. Usando um plugin
          //   postcss será uma opção melhor.
          postLoaders: {
            html: 'babel-loader'
          }
        }
      }
    ]
  }
}
```

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
    loaders: {
      // mesmo que as regras de configurações acima
    }
  }
}
```

Um uso mais prático das configurações avançadas do carregador é [extrair o CSS do componente em um único arquivo](./extract-css.md).