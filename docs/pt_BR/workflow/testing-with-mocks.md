# Testes com Mocks

Em uma aplicação do mundo real, nossos componentes provavelmente tem uma dependência externa. Ao escrever testes de unidades para componentes, seria ideal se pudéssemos simular \(mock\) essas dependências externas de modo que nossos testes dependam apenas do comportamento do componente que está sendo testado.

`vue-loader` fornece um recurso que permite você injetar dependências arbitrária para um componente `*.vue`, usando o [inject-loader](https://github.com/plasticine/inject-loader). A ideia geral é que, em vez de importar diretamente o módulo componente, nós usaremos `inject-loader` para criar uma função "fábrica de módulos" para este módulo. Quando está função é chamada com um objeto de mocks, ele retorna uma instância do módulo com os mocks injetados.

Suponha que temos um componente como este:

```html
<!-- exemplo.vue -->
<template>
  <div class="msg">{{ msg }}</div>
</template>

<script>
// está dependência precisa ser encadeada
import AgumServico from '../servico'

export default {
  data () {
    return {
      msg: AgumServico.msg
    }
  }
}
</script>
```

Veja como importá-lo com simulações:

> Nota: inject-loader@3.x está atualmente instável.

```bash
npm install inject-loader@^2.0.0 --save-dev
```

```js
// exemplo.spec.js
const ExemploInjecao = require('!!vue?inject!./exemplo.vue')
```

Observe que ele requer uma sequência de caracteres - nós estamos usando algumas [requisições de carregador webpack](https://webpack.github.io/docs/loaders.html) em linha aqui. Uma explicação rápida:

- `!!` no início significa "desative todos os carregadores da configuração global";
- `vue?inject!` significa "use o carregador de `vue`, e passe o `?inject` na consulta". Isso informa ao `vue-loader` para compilar o componente no modo injeção de dependência.

O retorno de `ExemploInjecao` é uma função de fábrica que pode ser chamada para criar instâncias do módulo `exemplo.vue`.

```js
const ExemploComMocks = ExemploInjecao({
  // simulação de serviço
  '../servico': {
    msg: 'Olá de uma simulação de serviço!'
  }
})
```

Finalmente, podemos testar o componente como de costume:

```js
it('Deve renderizar', () => {
  const vm = new Vue({
    template: '<div><test></test></div>',
    components: {
      'test': ExemploComMocks
    }
  }).$mount()
  expect(vm.$el.querySelector('.msg').textContent).toBe('Olá de uma simulação de serviço!')
})
```