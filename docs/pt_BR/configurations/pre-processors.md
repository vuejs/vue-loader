# Usando Pré-Processadores

No webpack, todos os pré-processadores precisam ser aplicados com um carregador \(loader\) correspondente. `vue-loader` permite que você use outros carregadores webpack para processar uma parte de um componente Vue. Ele irá automaticamente indicar os carregadores apropriados para usar a partir do atributo `lang` de um bloco de linguagem.

### CSS

Por exemplo, vamos compilar nossa tag `<style>` com SASS:

```bash
npm install sass-loader node-sass --save-dev
```

```html
<style lang="sass">
  /* Escreva sass aqui */
</style>
```

Por baixo do capô, o conteúdo de texto dentro da tag `<style>` será primeiramente compilado por `sass-loader` antes de ser passado para processadores posteriores.

#### Advertências de sass-loader

Ao contrário do que seu nome indica, [sass-loader](https://github.com/jtangelder/sass-loader) analisa a sintaxe *SCSS* por padrão. Se você atualmente deseja usar a indentação da sintaxe *SASS*, você tem que configurar as opções de vue-loader para sass-loader adequadamente.

```js
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
      sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
    }
  }
}
```

Consulte a seção de [configurações avançadas do carregador](./advanced.md)  para obter mais informações sobre como configurar vue-loader.

### JavaScript

Todos JavaScript dentro dos componentes Vue são processados por `babel-loader` por padrão. Mas você pode naturalmente mudar isto:

```bash
npm install coffee-loader --save-dev
```

```html
<script lang="coffee">
  # Escreva coffeescript!
</script>
```

### Templates

O processamento de templates é um pouco diferente, porque a maioria dos carregadores de template do webpack, como `pug-loader` retornam uma função de template em vez de uma sequência de caracteres HTML compilado. Em vez de usar `pug-loader`, podemos simplesmente instalar o `pug` original.

```bash
npm install pug --save-dev
```

```html
<template lang="pug">
div
  h1 Olá Mundo!
</template>
```

> **Importante:** Se você está usando `vue-loader@<8.2.0`, você também precisa instalar `template-html-loader`.

### Solicitação de Carregamento em Linha

Você pode usar \[solicitação de carregador webpack\] no atributo `lang`:

```html
<style lang="sass?outputStyle=expanded">
  /* use sass aqui com saída expandida */
</style>
```

Contudo, observe que isso faz com que seu componente Vue se torne especifico para webpack e não compatível com Browserify e [vueify](https://github.com/vuejs/vueify). **Se você pretende enviar seu componente Vue como um componente reutilizável para terceiros, evite usar está sintaxe**.
