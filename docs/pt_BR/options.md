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

### postcss.config

> New in 13.2.1

- type: `Object`
- default: `undefined`

  This field allows customizing PostCSS config in the same way as [postcss-loader](https://github.com/postcss/postcss-loader#config-1).

  - **postcss.config.path**

    Specify a path (file or directory) to load the PostCSS config file from.

    ``` js
    postcss: {
      config: {
        path: path.resolve('./src')
      }
    }
    ```

  - **postcss.config.ctx**

    Provide context to PostCSS plugins. See [postcss-loader docs](https://github.com/postcss/postcss-loader#context-ctx) for more details.

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

### compilerModules

- type: `Array<ModuleOptions>`
- default: `[]`

  Configure `modules` options for `vue-template-compiler`. In about details, see more [`modules` option](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options) of `vue-template-compiler`.

### compilerDirectives

- type: `{ [tag: string]: Function }`
- default: `{}` (v13.0.5+)

  > version note: in v12.x, supported in v12.2.3+

  Configure `directives` options for `vue-template-compiler`, In about details, see more [`directives` option](https://github.com/vuejs/vue/blob/dev/packages/vue-template-compiler/README.md#compilercompiletemplate-options) of `vue-template-compiler`.

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
### extractCSS

> New in 12.0.0

- type: `boolean`
- default: `false`

Automatically extracts the CSS using `extract-text-webpack-plugin`. Works for most pre-processors out of the box, and handles minification in production as well.

The value passed in can be `true`, or an instance of the plugin (so that you can use multiple instances of the extract plugin for multiple extracted files).

This should be only used in production so that hot-reload works during development.

Example:

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // other options...
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

Or passing in an instance of the plugin:

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var plugin = new ExtractTextPlugin("style.css")

module.exports = {
  // other options...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: plugin
        }
      }
    ]
  },
  plugins: [
    plugin
  ]
}
```

### optimizeSSR

> New in 12.1.1

- type: `boolean`
- default: `true` when the webpack config has `target: 'node'` and `vue-template-compiler` is at version 2.4.0 or above.

Enable Vue 2.4 SSR compilation optimization that compiles part of the vdom trees returned by render functions into plain strings, which improves SSR performance. In some cases you might want to explicitly turn it off because the resulting render functions can only be used for SSR and cannot be used for client-side rendering or testing.

### cacheBusting

> New in 13.2.0

- type: `boolean`
- default: `true` in development mode, `false` in production mode.

Whether generate source maps with cache busting by appending a hash query to the file name. Turning this off can help with source map debugging.
