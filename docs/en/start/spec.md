# Vue Component Spec

A `*.vue` file is a custom file format that uses HTML-like syntax to describe a Vue component. Each `*.vue` file consists of three types of top-level language blocks: `<template>`, `<script>` and `<style>`:

``` html
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>
```

`vue-loader` will parse the file, extract each language block, pipe them through other loaders if necessary, and finally assemble them back into a CommonJS module whose `module.exports` is a Vue.js component options object.

`vue-loader` supports using non-default languages, such as CSS pre-processors and compile-to-HTML template languages, by specifying the `lang` attribute for a language block. For example, you can use SASS for the style of your component like this:

``` html
<style lang="sass">
  /* write SASS! */
</style>
```

More details can be found in [Using Pre-Processors](../configurations/pre-processors.md).

### Language Blocks

#### `<template>`

- Default language: `html`.

- Each `*.vue` file can contain at most one `<template>` block at a time.

- Contents will be extracted as a string and used as the `template` option for the compiled Vue component. 

#### `<script>`

- Default language: `js` (ES2015 is supported by default via Babel).

- Each `*.vue` file can contain at most one `<script>` block at a time.

- The script is executed in a CommonJS like environment (just like a normal `.js` module bundled via Webpack), which means you can `require()` other dependencies. And because ES2015 is supported by default, you can also use ES2015 `import` and `export` syntax.

- The script must export a Vue.js component options object. Exporting an extended constructor created by `Vue.extend()` is also supported, but a plain object is preferred.

#### `<style>`

- Default Language: `css`.

- Multiple `<style>` tags are supported in a single `*.vue` file.

- By default, contents will be extracted and dynamically inserted into the document's `<head>` as an actual `<style>` tag using `style-loader`. It's also possible to [configure Webpack so that all styles in all components are extracted into a single CSS file](../configurations/extract-css.md).

### Src Imports

If you prefer splitting up your `*.vue` components into multiple files, you can use the `src` attribute to import an external file for a language block:

``` html
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

Beware that `src` imports follow the same path resolution rules to CommonJS `require()` calls, which means for relative paths you need to start with `./`, and you can import resources directly from installed NPM packages, e.g:

``` html
<!-- import a file from the installed "todomvc-app-css" npm package -->
<style src="todomvc-app-css/index.css">
```

### Syntax Highlighting

Currently there is syntax highlighting support for [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue), [Vim](https://github.com/posva/vim-vue), [Visual Studio Code](https://marketplace.visualstudio.com/items/liuji-jim.vue), [Brackets](https://github.com/pandao/brackets-vue), and [JetBrains products](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm, etc). Contributions for other editors/IDEs are highly appreciated! If you are not using any pre-processors in Vue components, you can also get by by treating `*.vue` files as HTML in your editor.

### Comments

Inside each block you shall use the comment syntax of the language being used (HTML, CSS, JavaScript, Jade, etc). For top-level comments, use HTML comment syntax: `<!-- comment contents here -->`
