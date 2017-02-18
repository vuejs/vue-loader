# Introdução

### O que é `vue-loader`?

`vue-loader` é um carregador para Webpack que pode transformar componentes Vue no seguinte formato em um módulo JavaScript simples:

![screenshot](http://blog.evanyou.me/images/vue-component.png)

Existem muitos recursos interessantes fornecidos por `vue-loader`:

- ES2015 habilitado por padrão;
- Permite usar outros carregadores Webpack para cada parte de um componente Vue, por exemplo SASS para `<style>` e Jade para `<template>`;
- Permite seções customizadas em um arquivo .vue que pode ter carregadores encadeados personalizados aplicados a eles;
- Trata ativos estáticos referenciado em `<style>` e `<template>` como dependência de módulo e então manipula com carregadores Webpack;
- Pode simular escopo CSS para cada componente;
- Suporta componente hot-reloading durante desenvolvimento;

Em poucas palavras, a combinação de Webpack e `vue-loader` oferece um moderno, flexível e extremamente poderoso fluxo de trabalho front-end para criação de aplicações Vue.js.

### O que é Webpack?

Se você já está familiarizado com Webpack, sinta-se livre para pular está explicação. Mas para aqueles de vocês que são novos com Webpack, aqui está uma pequena introdução:

[Webpack](http://webpack.github.io/) é um empacotador de módulo. Ele pega um grupo de arquivos, trata cada um como um módulo, descobre as dependências entre eles e empacota em ativos estáticos prontos para implantação.

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

Para um exemplo básico, imagine que nós temos um monte de módulos CommonJs. Eles não podem rodar diretamente dentro do navegador, então precisamos empacotá-los dentro de um único arquivo que pode ser incluído através de uma tag `<script>`. Webpack pode seguir as dependências das chamadas  `require()` e fazer isso para nós.

Mas Webpack pode fazer mais do que isso. Com "loaders", podemos ensinar Webpack a transformar todos os tipos de arquivos dá maneira que quisermos antes da saída final do pacote. Alguns exemplos incluem:

- Transpilar módulos ES2015, CoffeScript ou TypeScript em módulos simples CommonJs ES5;
- Opcionalmente você pode canalizar o código fonte através de um linter \(analisador de código\) antes de fazer a compilação;
- Transpilar modelos Jade em HTML simples em seguida colocá-lo como uma sequência de string JavaScript;
- Traspilar arquivos SASS em CSS simples, em seguida os converter em trechos de código JavaScript que insere o resultado CSS como uma tag `<style>`;
- Processar um arquivo de imagem referenciado em HTML ou CSS, movê-la para o destino desejado baseado no arquivo de configuração, e nomeá-la usando seu hash md5; 

Webpack é tão poderoso que quando você entender como ele funciona, poderá melhorar drasticamente seu fluxo de trabalho front-end. Sua principal desvantagem é a configuração excessiva e complexa; Mas com este guia você deve se capaz de encontrar solução para muitas questões comuns usando Webpack com Vue.js e `vue-loader`.