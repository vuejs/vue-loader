# Blocos customizados

> Requer versão 10.2.0+

Você pode definir blocos de linguagem customizados dentro de arquivos `*.vue`. O conteúdo do bloco customizado será processado pelos carregadores especificados na opção `loaders` do objeto de configuração `vue-loader` e então requerido pelo módulo componente. A configuração é semelhante a descrita em [Configurações Avançada do Carregador](../configurations/advanced.md), exceto o uso padrão do nome da tag em vez do atributo `lang`;

Se for encontrado um carregador correspondente para um bloco customizado, ele será processado. Caso contrário o bloco customizado será simplesmente ignorado. Além disso, se o carregador encontrado retornar uma função, essa função será chamada com o componente do arquivo `* .vue` como um parâmetro.

## Exemplo de arquivo docs simples

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

```js
// webpack 2.x
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // extrai todo conteúdo de <docs> em texto bruto
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ]
  },
  plugins: [
    // saída de todos os docs em um único arquivo
    new ExtractTextPlugin('docs.md')
  ]
}
```

## Documentos disponíveis em tempo de execução.

> Requer versão 11.3.0+

Aqui está um exemplo de injetar os blocos personalizados `<docs>` no componente para que ele esteja disponível durante o tempo de execução.

### docs-loader.js

Para que o conteúdo do bloco personalizado seja injetado, precisamos de um carregador personalizado:

```js
 module.exports = function (source, map) {
   this.callback(null, 'module.exports = function(Component) {Component.options.__docs = ' +
     JSON.stringify(source) +
     '}', map)
 }
 ```

#### webpack.config.js

Agora, vamos configurar o webpack para usar o nosso carregador personalizado para blocos customizados `<docs>`.

``` js
 const docsLoader = require.resolve('./custom-loaders/docs-loader.js')

 module.exports = {
   module: {
     rules: [
       {
         test: /\.vue$/,
         loader: 'vue-loader',
         options: {
           loaders: {
             'docs': docsLoader
           }
         }
       }
     ]
   }
 }
 ```

 #### component.vue

 Agora podemos acessar o conteúdo do bloco `<docs>` de componentes importados durante o tempo de execução.

 ``` html
 <template>
   <div>
     <component-b />
     <p>{{ docs }}</p>
   </div>
 </template>

 <script>
 import componentB from 'componentB';

 export default = {
   data () {
     return {
       docs: componentB.__docs
     }
   },
   components: {componentB}
 }
 </script>
 ```
