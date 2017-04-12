# Construir produção

Há duas coisas a fazer ao construir nosso pacote para produção:

1. Minificar o código de nossa aplicação;
2. Use a [configuração descrita no guia Vue.js](https://vuejs.org/guide/deployment.html) para remover todos os avisos de código-fonte Vue.js;

Aqui está um exemplo de configuração:

```js
// webpack.config.js
module.exports = {
  // ...outras opções
  plugins: [
    // liga em curto-circuito todo código de aviso Vue.js
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // minifica com eliminação de código morto
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // Webpack 1 apenas - otimiza ids de módulo por contagem de ocorrências
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
}
```

Obviamente não queremos usar estás configurações durante o desenvolvimento, então há várias maneiras de abordar isso:

1. Crie dinamicamente o objeto de configuração com base em uma variável de ambiente.

2. Ou use dois arquivos de configuração do Webpack separados,  um para o desenvolvimento e outro para produção. E talvez compartilhe algumas opções comuns entre eles em um terceiro arquivo, como mostrado em [vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0).

Isto é com você, desde que o objetivo seja atingido.
