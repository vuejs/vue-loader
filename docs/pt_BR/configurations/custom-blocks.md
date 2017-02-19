# Blocos customizados

> Requer versão 10.2.0+

Você pode definir blocos de linguagem customizados dentro de arquivos `*.vue`. O conteúdo do bloco customizado será processado ppelos carregadores especificados na opção `loaders` do objeto de configuração `vue-loader` e então requerido pelo módulo componente. A configuração é semelhante a descrita em [Configurações Avançada do Carregador](../configurations/advanced.md), exceto o uso padrão do nome da tag em vez do atributo `lang`;

Se for encontrado um carregador correspondente para um bloco customizado, ele será processado. Caso contrário o bloco customizado será simplesmente ignorado.

## Exemplo

Aqui está um exemplo de extração de todos os blocos customizados `<docs>` em um único arquivo docs;

#### componente.vue

``` html
<docs>
  ## Isto é um componente de exemplo.
</docs>

<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Olá do Componente A!'
    }
  }
}
</script>

<style>
comp-a h2 {
  color: #f00;
}
</style>
```

#### webpack.config.js

``` js
// Webpack 2.x
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          loaders: {
            // extrai todo conteúdo de <docs> em texto bruto
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ],
    plugins: [
      // saída de todos os docs em um único arquivo
      new ExtractTextPlugin('docs.md')
    ]
  }
}
```
