# Testando

> O [template vue-cli do webpack](https://github.com/vuejs-templates/webpack)  oferece testes de unidade pré-configurados e configurações de teste es2 para você.

Ao testar arquivos `*.vue` não podemos usar um corredor de teste simples baseado em CommonJs, porque ele não sabe como manipular arquivos `*.vue`. Em vez disso, nós ainda usaremos Webpack + vue-loader para manipular nossos arquivos de teste. A configuração recomendada é usando [Karma](http://karma-runner.github.io/0.13/index.html) e [karma-webpack](https://github.com/webpack/karma-webpack).

Karma é um corredor de teste que inicia navegadores e executa seus testes. Você pode escolher qual navegador você quer para testar e qual framework \(exemplo: Mocha ou Jasmine\) você quer usar. Aqui está um exemplo de configuração Karma que executa os testes dentro de [PhantomJS](http://phantomjs.org/) com o framework de teste [Jasmine](http://jasmine.github.io/edge/introduction.html).

```bash
npm install\
  karma karma-webpack\
  karma-jasmine jasmine-core\
  karma-phantomjs-launcher phantomjs\
  --save-dev
```

```js
// podemos usar a mesma configuração que é exigida pelo webpackm
// entretanto, lembre-se de remover a entrada original, uma vez 
// que não precisamo durante os testes
var webpackConfig = require('./webpack.config.js')
delete webpackConfig.entry

// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    // este é o arquivo de entrada para todos os nossos testes
    files: ['test/index.js'],
    // vamos passar o arquivo de entrada para webpack empacotar
    preprocessors: {
      'test/index.js': ['webpack']
    },
    // use a configuração do webpack
    webpack: webpackConfig,
    // evita pedaços de texto inúteis
    webpackMiddleware: {
      noInfo: true
    },
    singleRun: true
  })
}
```

E para o arquivo `test/index.js` de entrada:

```js
// test/index.js
// requisita todos os arquivos de testes usando 0 recursos especial do Webpack
// https://webpack.github.io/docs/context.html#require-context
var testsContext = require.context('.', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
```

Este recurso de entrada simplesmente requisita todos os outros arquivos na pasta que terminam com `.spec.js`. Agora podemos realmente escrever alguns testes:

```js
// test/component-a.spec.js
var Vue = require('vue')
var ComponentA = require('../../src/components/a.vue')

describe('a.vue', function () {

  // Opções JavaScript de afirmação (asserting)
  it('should have correct message', function () {
    expect(ComponentA.data().msg).toBe('Olá do componente A!')
  })

  // Afirmando o resultado renderizado fornecido pelo componente
  it('should render correct message', function () {
    var vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        'test': ComponentA
      }
    }).$mount()
    expect(vm.$el.querySelector('h2.red').textContent).toBe('Olá do componente A!')
  })
})
```

Para executar os testes, adicione o seguinte script NPM:

```js
// package.json
...
"scripts": {
  ...
  "test": "karma start karma.conf.js"
}
...
```

Finalmente execute:

```bash
npm test
```

Novamente, [template vue-cli webpack](https://github.com/vuejs-templates/webpack) contém um exemplo totalmente funcional com testes.