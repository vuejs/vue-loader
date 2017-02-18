# Análise estática do código \(Linting\)

Você pode ter se perguntado como você analisa seu código dentro dos seus arquivos `*.vue`, uma vez que eles não são JavaScript. Vamos supor que você está usando [ESLint](http://eslint.org/) \(se você não está, deveria\).

Você também precisará do [eslint-plugin-html](https://github.com/BenoitZugmeyer/eslint-plugin-html) que suporte de extração e análise estática \(linting\) do JavasScript dentro dos arquivos `*.vue`.

Certifique-se de incluir o plugin dentro de suas configurações ESLint:

```json
"plugins": [
    "html"
]
```

Em seguida, a partir da linha de comando:

```bash
eslint --ext js,vue MeuComponente.vue
```

Outra opção é usar [eslint-loader](https://github.com/MoOx/eslint-loader) para que seus arquivos `*.vue` sejam automaticamente analisados ao serem salvo durante o desenvolvimento:

```bash
npm install eslint eslint-loader --save-dev
```

```js
// webpack.config.js
module.exports = {
    // ... outras opções
    module: {
        loaders: [
            {
                test: /.vue$/,
                loader: 'vue!eslint'
            }
        ]
    }
}
```

Lembre-se que a sequência dos carregadores Webpack são aplicados da **direita para esquerda**. Certifique-se de aplicar `eslint` antes de `vue`, de modo que estamos analisando o código fonte pré-compilado.

Uma coisa que precisamos considerar é o uso de componente `*.vue` de terceiros enviados em pacote NPM. Neste caso, usaremos `vue-loader` para processar os componentes de terceiros, mas não queremos aplicar a análise de código estático \(linting\). Para isso nós podemos separar o linting em [preLoaders](https://webpack.github.io/docs/loaders.html#loader-order) do Webpack.

```js
// webpack.config.js
module.exports = {
    // ... outras opções
    module: {
        // lint apenas em arquivos *.vue locais
        preLoaders: [
            {
                test: /.vue$/,
                loader: 'eslint',
                exclude: /node_modules/
            }
        ],
        // mas usa vue-loader para todos arquivos *.vue
        loaders: [
            {
                test: /.vue$/,
                loader: 'vue'
            }
        ]
    }
}
```

Para Webpack 2.x:

```js
// webpack.config.js
module.exports = {
    // ... outras opções
    module: {
        rules: [
            // lint apenas em arquivos *.vue locais
            {
                enforce: 'pre',
                test: /.vue$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            },
            // mas usa vue-loader para todos arquivos *.vue
            {
                test: /.vue$/,
                loader: 'vue-loader'
            }
        ]
    }
}
```