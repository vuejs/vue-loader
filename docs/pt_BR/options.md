# Referência de Opções

## Diferença do uso entre Webpack 1 & 2

Para Webpack 2: passe as opções diretamente para a regra do carregador.

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // opções de vue-loader
        }
      }
    ]
  }
}
```

Para Webpack 1.x: Adicione um bloco \`vue\` na raiz de suas configurações Webpack:

```js
module.exports = {
  // ...
  vue: {
    // opções de vue-loader
  }
}
```

### loaders

- tipo: `{ [lang: string]: string }`

  Um objeto especificando carregadores de Webpack para substituir carregadores padrão usados para blocos de linguagem dentro de arquivos `*.vue`. A chave corresponde ao atributo `lang` para o bloco de linguagem, se especificado. O padrão `lang` para cada tipo é:

  - `<template>`: `html`
  - `<script>`:`js`
  - `<style>`: `css`

  Por exemplo, para usar `babel-loader` e `eslint-loader` para processar todos os blocos `<script>`:

```js
  // Configuração Webpack 2.X
  module: {
    rules: {
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          js: 'babel-loader!eslint-loader'
        }
      }
    }
  }
```

### preLoaders

- tipo: `{ [lang: string]: string }`
- suportado apenas em >=10.3.0

  O formato de configuração é o mesmo que `loaders`, mas `preLoaders` são aplicados aos blocos de linguagem correspodentes antes dos carregadores padrões. Você pode usar isto para pré-processar blocos de linguagem - um caso de uso comum seria contruir em [internacionalização (i18n)](https://pt.wikipedia.org/wiki/Internacionaliza%C3%A7%C3%A3o_(inform%C3%A1tica)) tempo real.

### postLoaders

- tipo: `{ [lang: string]: string }`
- suportado apenas em >= 10.3.0

  O formato de configuração é o mesmo que `loaders`, mas `postLoaders` são aplicados depois dos carregadores padrões. Você pode usar para pós-processar blocos de linguagem. No entanto note que isso é um pouco mais complicado:
  
  - Para `html`, o resultado retornado pelo carregador padrão será compilado em código de função de renderização JavaScript.

  - Para `css`, o resultado será retornado por `vue-style-loader` que não é particularmente útil na maioria dos casos. Usando um plugin postcss será uma opção melhor.

### postcss

> Nota: em versões >= 11.0.0 é recomendável usar um arquivo de configuração PostCSS em vez disso. O uso é o mesmo que [postcss-loader](https://github.com/postcss/postcss-loader#usage).

- tipo: `Array`, `Function` ou `Object`

  Especifica plugins PostCSS personalizados para serem aplicado a CSS dentro de arquivos `*.vue`. Se estiver usando uma função, a função irá ser chamada usando o mesmo contexto do loader e deve retornar uma coleção de plugins.

  ```js
  // ...
  {
    loader: 'vue-loader',
    options: {
      // Nota: não alinhe a opção `postcss` sob `loaders`
      postcss: [require('postcss-cssnext')()],
      loaders: {
        // ...
      }
    }
  }
  ```

  Está opção também pode ser um objeto que contém opções para ser passada para o processador PostCSS. Isto é útil quando você está usando projetos PostCSS que entrega um parser/stringifiers personalizado:

  ```js
  postcss: {
    plugins: [...], // lista de plugins
    options: {
      parser: sugarss // use o analisador de sugarss
    }
  }
  ```

### cssSourceMap

- tipo: `Boolean`
- padrão: `true`

  Se deve habilitar mapas de origem para CSS. Desativar isso pode evitar alguns erros relacionado a caminho relativo em `css-loader` e fazer a construção um pouco mais rápida.

  Observe que isso é automaticamente definido para `false` se a opção `devtoo` não estiver presente na configuração princípai de Webpack.

### esModule

- tipo: `Boolean`
- padrão: `undefined`

  Se deve emitir código compatível esModule. Por padrão vue-loader irá emitir a exportação padrão em formato CommonJs como `module.exports = ...`. Quando `esModule` estiver definido como true, a exportação padrão irá ser transpilada em `exports.__esModule = true; exports = ...`. Útil para interoperação com transpiladores diferente de Babel, como TypeScript.

### preserveWhitespace

- tipo: `Boolean`
- padrão: `true`

  Se definido para `false`, os espaços em branco entre as tags HTML em templates serão ignorados.

### transformToRequire

- tipo: `{ [tag: string]: string | Array<string> }`
- padrão: `{ img: 'src', image: 'xlink:href' }`

  Durante a compilação do template, o compilador pode transformar certos atributos, tais como URLs `src`, em chamadas `require`, para que o recurso de destino possa ser manipulado pelo Webpack. A configuração padrão transforma o atributo `src` em tags `<img>` e atributos `xlink:href` em tags `<image>` de SVG.

### buble

- tipo: `Object`
- padrão: `{}`

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

      // desliga a remoção 'with'
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



