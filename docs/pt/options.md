# Opções de Referência

### Diferença do uso entre Webpack 1 e 2

Para Webpack 1.x: Adicione um bloco \`vue\` na raiz nas suas configurações Webpack:

```js
module.exports = {
  // ...
  vue: {
    // vue-loader options
  }
}
```

Para Webpack 2 \(^2.1.0-beta.25\)

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // vue-loader options
        }
      }
    ]
  }
}
```

### loaders

* type: `Object`

  Um objeto que especifica carregadores de Webpack para usar para blocos de linguagem dentro de arquivos `*.vue`. A chave corresponde ao atributo `lang` para o bloco de linguagem, se especificado. O padrão `lang` para cada tipo é:

  * `<template>`: `html`
  * `<script>`:`js`
  * `<style>`: `css`

  Por exemplo, para usar `babel-loader` e `eslint-loader` para processar todos os blocos `<script>`:

  ```js
  // ...
  vue: {
    loaders: {
      js: 'babel!eslint'
    }
  }
  ```

### postcss

* type: `Array` ou `Function` ou `Object`
* Formato `Object` suportado apenas em ^8.5.0

  Especifica plugins PostCSS customizados para serem aplicado a CSS dentro de arquivos `*.vue`. Se estiver usando uma função, a função irá ser chamada usando o mesmo contexto do loader e deve retornar uma coleção de plugins.

  ```js
  // ...
  vue: {
    // Nota: não alinhe a opção `postcss` sobre `loaders`
    postcss: [require('postcss-cssnext')()],
    loaders: {
      // ...
    }
  }
  ```

  Está opção também pode ser um objeto que contém opções para ser passada para o processador PostCSS. Isto é útil quando você está usando projetos PostCSS que entrega um parser/stringifiers personalizado:

  ```js
  postcss: {
    plugins: [...], // lista de plugins
    options: {
      parser: sugarss // use o analizador de sugarss
    }
  }
  ```

### cssSourceMap

* tipo: `Boolean`
* padrão: `true`

  Se deve habilitar mapas de origem para CSS. Desativar isso pode evitar alguns erros relacionado a caminho relativo em `css-loader` e fazer a construção um pouco mais rápida.

  Observe que isso é automaticamente definido para `false` se a opção `devtoo` não estiver presente na configurações principai de Webpack.

### esModule

* tipo: `Boolean`
* padrão: `undefined`

  Se deve emitir código compatível esModule. Por padrão vue-loader irá emitir a exportação padrão em formato CommonJs como `module.exports = ...`. Quando `esModule` estiver definido como true, a exportação padrão irá ser transpilada em `exports.__esModule = true; exports = ...`. Útil para interoperação com transpiladores diferente de Babel, como TypeScript.

### preserveWhitespace

* tipo: `Boolean`
* padrão: `true`

  Se definido para `false`, os espaços em branco entre as tags HTML em templates serão ignorados.

### transformToRequire

* tipo: `{ [tag: string]: string | Array<string> }`
* padrão: `{ img: 'src' }`

  Durante a compilação do template, o compilador pode transformar certos atributos, tais como URLs `src`, em chamadas `require`, para que o recurso de destino possa ser manipulado pelo Webpack. A configuração padrão transforma o atributo `src` em tags `<img>`.

### buble

* tipo: `Object`
* padrão: `{}`

  Opções de configuração para o `buble-loader` \(Se estiver presente\), E a compilação buble passa para o template as funções de renderização.

  > Nota de versão: Na versão 9.x, as expressões do template são configuradas separadamente através da opção `templateBudle` agora removida.

  A função de renderização do template suporta uma transformação especial `stripWith` \(habilitada por padrão\), que remove o `with` usado em funções de renderização geradas para torná-las compatíveis com modelo estrito.

  Exemplo de configuração:

  ```js
  // webpack 1
  vue: {
    buble: {
      // ativa o objeto de propagação 
      // NOTA: Você precisa fornecer o polyfill Object.assign por si mesmo!
      objectAssign: 'Object.assign',

      // desliga a remoção 'com'
      transforms: {
        stripWith: false
      }
    }
  }

  // webpack 2
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          buble: {
            // mesmas opções
          }
        }
      }
    ]
  }
  ```