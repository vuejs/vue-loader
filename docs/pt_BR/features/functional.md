# Template para componentes funcionais

> Novo em 13.1.0, requer Vue >= 2.5.0

Com `vue-loader >= 13.3.0`, componentes funcionais definidos como um componente de arquivo único em um arquivo `*.vue` agora aproveita a compilação de modelo apropriada, CSS com escopo e suporte a injeção de módulos em tempo de execução \(hot-reloading\).

Para dizer que um template que deve ser compilado como um componente funcional, adicione o atributo `funcional` ao bloco do template. Isso também permite omitir a opção `funcional` no bloco` <script> `.

As expressões no template são avaliadas no [contexto de renderização funcional](https://vuejs.org/v2/guide/render-function.html#Functional-Components). Isso significa que as propriedades precisam ser acessados ​​como `props.xxx` no template:

``` html
<template functional>
  <div>{{ props.foo }}</div>
</template>
```
