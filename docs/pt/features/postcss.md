# PostCSS

Qualquer saída CSS processada por `vue-loader` é canalizada através de [PostCSS](https://github.com/postcss/postcss) para escrever o escopo CSS. Você também pode adicionar plugins PostCSS personalizado ao processador, por exemplo [autoprefixer](https://github.com/postcss/autoprefixer) or [CSSNext](http://cssnext.io/).

Exemplo de uso no Webpack 1.x:

```js
// webpack.config.js
module.exports = {
  // outras configurações...
  vue: {
    // use plugins personalizado de postcss
    postcss: [require('postcss-cssnext')()]
  }
}
```

Para Webpack 2.x:

```js
// webpack.config.js
module.exports = {
  // outras opções...
  module: {
    // module.rules é o mesmo que module.loaders em 1.x
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

* Uma função que retorna uma coleção de plugins:

* Um objeto que contém opções para ser passado para o processador PostCSS. Isto é útil quando você está usando projetos com PostCSS que depende de analisadores/stringifiers personalizados:

  ```js
  postcss: {
    plugins: [...], // Lista de Plugins
    options: {
      parser: sugarss // Use o analisador sugarss
    }
  }
  ```