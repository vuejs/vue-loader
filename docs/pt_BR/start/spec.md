# Especificação do componente Vue

Um arquivo `*.vue` é um formato de arquivo personalizado que usa sintaxe semelhante HTML para descrever um componente Vue. Cada arquivo `*.vue` consiste em três tipos de bloco de linguagem de nível superior: `<template>`, `<script>`, `<style>` e opcionalmente blocos customizados adicionais:

```html
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
  export default {
    data () {
      return {
        msg: 'Olá Mundo!'
      }
    }
  }
</script>

<style>
  .example {
    color: red;
  }
</style>

<custom1>
  Iso poderia ser a documentação do componente.
</custom1>
```

`vue-loader` analisará o arquivo, extrair cada bloco de linguagem canalizá-lo através de outros carregadores se necessário, e finalmente montá-lo de volta em um módulo CommonJs cujo `module.exports` seja um objeto de opções do componente Vue.js.

`vue-loader` suporta o uso de linguagens não-padrão, tais como pré-processadores CSS e linguagem que compila para HTML a partir de um template, especificando o atributo `lang` para um bloco de linguagem. Por exemplo, você pode usar SASS para o estilo do seu componente como este:

```html
<style lang="sass">
  /* escreva SASS! */
</style>
```

Mais detalhes podem ser encontrados em [Usando Pré-Processadores](../configurations/pre-processors.md).

### Blocos de Linguagem

#### `<template>`

- Linguagem padrão: `html`.

- Cada arquivo `*.vue` pode conter no máximo um bloco `<template>` por vez.

- O Conteúdo será extraído como uma string e usado como a opção `template` para o componente Vue compilado.

#### `<script>`

- Linguagem padrão: `js` \(ES2015 é suportado automaticamente se `babel-loader` ou `buble-loader` for detectado\).

- Cada arquivo `*.vue` pode conter no máximo um bloco de `<script>` por vez.

- O script é executado em um ambiente CommonJs \(Como um módulo `.js` normal manipulado via webpack\), o que significa que você pode usar `require()` para requisitar outras dependências. E com ES2015 suportado, você também pode usar a sintaxe `import` e `export`.

- O script deve exportar um objeto de opções de componente Vue. Também é suportador exportar um construtor estendido criado por `Vue.extend()`, mas um objeto simples é preferível.

#### `<style>`

- Linguagem padrão: `css`.

- Várias tags `<style>` são suportadas em um único arquivo `*.vue`.

- Uma tag `<style>` pode ter atributos `scoped` ou `module` \(consulte [CSS com Escopo](../features/scoped-css.md) e [Módulos CSS](../features/css-modules.md)\)\) para ajudar encapsular o estilo para o seu componente atual. Várias tags `<style>` com diferente modos de encapsulamento pode ser misturados em um mesmo componente.

- Por padrão, o conteúdo será extraído e inserido dinamicamente no `<head>` do documento atual como uma tag `<style>` usando `style-loader`. Também é possível [configurar o webpack para que todos os estilos em todos os componentes sejam extraídos em um único arquivo CSS](../configurations/extract-css.md).

### Blocos customizados

> Suportado apenas em vue-loader 10.2.0+

Blocos customizados adicionais pode ser incluídos em um arquivo `*.vue` para qualquer necessidade específica do projeto, por exemplo um bloco `<docs>`. `vue-loader` usará o nome da tag para procurar por carregadores de webpack. Os carregadores dever ser adicionados na opção `loaders` de `vue-loader`.

Para mais detalhes, veja [Blocos Customizados](../configurations/custom-blocks.md).

### Importações src

Se você preferir dividir seus componentes `*.vue` em vários arquivos, você pode usar o atributo `src` para importar um arquivo externo para um bloco de linguagem:

```html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

Tenha em mente que as importações `src` seguem as mesmas regras de resolução de caminho que as chamadas `require()` do CommonJs, isto significa que para caminhos relativo você precisará iniciar com `./`, e você pode importar recursos diretamente a partir de pacotes instalado com NPM, exemplo:

```html
<!-- importa um arquivo do pacote npm "todomvc-app-css" instalado -->
<style src="todomvc-app-css/index.css"></style>
```

As importações `src` também funcionam com blocos customizados, por exemplo:

``` html
<unit-test src="./unit-test.js"></unit-test>
```

### Realce de Sintaxe

Atualmente existem realce de sintaxe \(ou [coloração de sintaxe](https://pt.wikipedia.org/wiki/Realce_de_sintaxe)\) suportado para [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), e [JetBrains products](https://plugins.jetbrains.com/plugin/8057) \(WebStorm, PhpStorm, etc\). Contribuições para outros editores/IDEs são incentivadas e muito bem-vindas! Se você não estiver usando nenhum pré-processador em componentes Vue, você também pode tratar arquivos `*.vue` como HTML em seu editor.

### Comentários

Dentro de cada bloco você deve usar a sintaxe de comentário da linguagem que está sendo usada \(HTML, CSS, JavaScript, Jade, etc\). Para comentários de nível superior, use a sintaxe de comentário HTML: `<!-- conteúdo do comentário aqui -->`
