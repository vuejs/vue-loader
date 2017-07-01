# CSS com Escopo

Quando uma tag `<style>` tem o atributo `scoped`, seu CSS será aplicado somente a elementos do componente atual. Isto é semelhante a encapsulamento de estilo encontrado em Shadow DOM. Ele vem com algumas ressalvas, mas não requer nenhum polyfills. Isto é alcançado usando PostCSS para transformar o seguinte:

```html
<style scoped>
  .example {
    color: red;
  }
</style>

<template>
  <div class="example">hi</div>
</template>
```

Para o seguinte:

```html
<style>
.example[data-v-f3f3eg9] {
   color: red;
 }
</style>

<template>
  <div class="example" data-v-f3f3eg9>hi</div>
</template>
```

#### Observações

1. Você pode incluir ambos os estilos com escopo e sem escopo no mesmo componente:

   ```html
   <style>
       /* Estilo global */
   </style>

   <style scoped>
       /* Estilo local */
   </style>
   ```

2. Um nó raiz do componente filho irá ser afetado por ambos os CSS com escopo dos parentes e o CSS com escopo dos filhos.

3. Templates parciais não são afetados por estilo com escopo.

4. **Os estilos com escopo não eliminam a necessidade de classes**. Devido a forma como navegadores processam vários seletores CSS, `p { color: red }` irá ser muitas vezes mais lento quando com escopo \(exemplo: quando combinado com um seletor de atributo\). Se você usa classes ou ids ao invés, como em `.example { color: red }`, então você elimina praticamente esse desempenho atingido. [Aqui está um playground](http://stevesouders.com/efws/css-selectors/csscreate.php) onde você pode testar as diferenças você mesmo.

5. **Tenha cuidado com seletores descendentes em componentes recursivos!** Para uma regra CSS com o seletor `.a .b`, se o elemento que coincide com `.a` contém um componente filho recursivo, então todos os `.b` nesse componente filho serão correspondidos pela regra.

6. Se você precisa de seletores aninhados em estilos `scoped`, você terá que usar o operador `>>>` para CSS e `/deep/` para `scss`:

``` html
<style scoped>
.a >>> .b {

}
</style>
     
<style lang="scss" scoped>
 .a /deep/ .b {

}
</style>
 ```
