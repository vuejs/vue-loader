# PostCSS

Qualquer saída CSS processada por `vue-loader` é canalizada através de [PostCSS](https://github.com/postcss/postcss) para escrever o escopo CSS. Você também pode adicionar plugins PostCSS personalizado ao processador, por exemplo [autoprefixer](https://github.com/postcss/autoprefixer) ou [CSSNext](http://cssnext.io/).

## Usando um Arquivo de Configuração

A partir da versão 11.0, `vue-loader` suporta o carregamento automático dos mesmo arquivos de configuração do PostCss suportados por [`postcss-loader`](https://github.com/postcss/postcss-loader#usage):

- `postcss.config.js`
- `.postcssrc`
- Opção `postcss` em `package.json`

O uso de um arquivo de configuração permite que você compartilhe a mesma configuração entre seus arquivos CSS normais processados por `postcss-loader` e os arquivos CSS dentro de arquivos `*.vue`, isto é o recomendado.

## Opções em Linha

Como alternativa, você pode especificar configurações PostCSS especificamente para arquivos `*.vue` usando a opção `postcss` para `vue-loader`.

Exemplo de uso no webpack 1.x:

```js
// webpack.config.js
module.exports = {
  // outras configurações...
  vue: {
    // use plugins personalizado de PostCSS
    postcss: [require('postcss-cssnext')()]
  }
}
```

Para webpack 2.x:

```js
// webpack.config.js
module.exports = {
  // outras opções...
  module: {
    // `module.rules` é o mesmo que `module.loaders` em 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // opções vue-loader options vai aqui
        options: {
          // ...
          postcss: [require('postcss-cssnext')()]
        }
      }
    ]
  }
}
```

Além de fornecer uma coleção de plugins, a opção de `postcss` também aceita:

- Uma função que retorna uma coleção de plugins:

- Um objeto que contém opções para ser passado para o processador PostCSS. Isto é útil quando você está usando projetos com PostCSS que depende de analisadores/stringifiers personalizados:

  ```js
  postcss: {
    plugins: [...], // Lista de Plugins
    options: {
      parser: sugarss // Use o analisador sugarss
    }
  }
  ```
