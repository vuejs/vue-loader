# Introdução

### O que é `vue-loader`?

`vue-loader` é um carregador para webpack capaz de transformar componentes Vue, como o exemplo abaixo, em um módulo JavaScript sem formatação:

![screenshot](http://blog.evanyou.me/images/vue-component.png)

O `vue-loader` fornece muitos recursos interessantes:

- ES2015 habilitado por padrão;
- Permite usar outros carregadores webpack para cada parte de um componente Vue, por exemplo SASS para `<style>` e Jade para `<template>`;
- Permite seções customizadas em um arquivo .vue que pode ter carregadores encadeados personalizados aplicados a eles;
- Trata ativos estáticos referenciado em `<style>` e `<template>` como dependência de módulo e então manipula com carregadores webpack;
- Pode simular escopo CSS para cada componente;
- Suporta componente hot-reloading durante desenvolvimento;

Em poucas palavras, a combinação de webpack e `vue-loader` oferece um fluxo de trabalho front-end moderno, flexível e extremamente poderoso para criação de aplicações Vue.js.

### O que é webpack?

Se você já esta familiarizado com o webpack, fique à vontade para pular esta seção. Para aqueles que não conhecem o webpack, aqui segue uma rápida introdução:

[webpack](http://webpack.github.io/) é um empacotador de módulo. Ele pega um grupo de arquivos, trata cada um como um módulo, descobre as dependências entre eles e empacota em ativos estáticos prontos para implantação.

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

Para um exemplo básico, imagine que nós temos um monte de módulos CommonJs. Eles não podem rodar diretamente dentro do navegador, então precisamos empacotá-los dentro de um único arquivo que pode ser incluído através de uma tag `<script>`. webpack é capaz de mapear as dependências injetadas pelas chamadas `require()` e empacotá-las para nós.

Mais do que isso, com o uso dos "loaders" o webpack é capaz de transformar todos os tipos de arquivos da maneira como quisermos, antes do término da geração do pacote. Alguns exemplos incluem:

- Transpilar módulos ES2015, CoffeScript ou TypeScript em módulos simples CommonJs ES5;
- Você pode escolher se quer canalizar o código fonte através de um linter \(analisador de código\) antes de fazer a compilação;
- Transpilar modelos Jade em HTML sem formatação e em seguida colocá-lo como uma sequência de string JavaScript;
- Traspilar arquivos SASS em CSS sem formatação, em seguida os converter em trechos de código JavaScript que insere o resultado CSS como uma tag `<style>`;
- Processar um arquivo de imagem referenciado em HTML ou CSS, movê-la para o destino desejado baseado no arquivo de configuração, e nomeá-la usando seu hash md5;

webpack é tão poderoso que quando você entender como ele funciona, poderá melhorar drasticamente seu fluxo de trabalho front-end. Sua principal desvantagem é a configuração excessiva e complexa; Mas com este guia você deve se capaz de encontrar solução para muitas questões comuns usando webpack com Vue.js e `vue-loader`.
