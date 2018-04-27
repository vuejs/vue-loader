---
title: SFC Spec
sidebar: auto
---

# Vue Single-File Component (SFC) Spec

## Intro

A `*.vue` file is a custom file format that uses HTML-like syntax to describe a Vue component. Each `*.vue` file consists of three types of top-level language blocks: `<template>`, `<script>`, and `<style>`, and optionally additional custom blocks:

``` vue
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

<custom1>
  This could be e.g. documentation for the component.
</custom1>
```

`vue-loader` will parse the file, extract each language block, pipe them through other loaders if necessary, and finally assemble them back into an ES Module whose default export is a Vue.js component options object.

`vue-loader` supports using non-default languages, such as CSS pre-processors and compile-to-HTML template languages, by specifying the `lang` attribute for a language block. For example, you can use Sass for the style of your component like this:

``` vue
<style lang="sass">
  /* write Sass! */
</style>
```

More details can be found in [Using Pre-Processors](./guide/pre-processors.md).

## Language Blocks

### Template

- Each `*.vue` file can contain at most one `<template>` block at a time.

- Contents will be extracted and passed on to `vue-template-compiler` and pre-compiled into JavaScript render functions, and finally injected into the exported component in the `<script>` section.

### Script

- Each `*.vue` file can contain at most one `<script>` block at a time.

- The script is executed as an ES Module.

- The **default export** should be a Vue.js [component options object](https://vuejs.org/v2/api/#Options-Data). Exporting an extended constructor created by `Vue.extend()` is also supported, but a plain object is preferred.

- Any webpack rules that match against `.js` files (or the extension specified by the `lang` attribute) will be applied to contents in the `<script>` block as well.

### Style

- Default match: `/\.css$/`.

- A single `*.vue` file can contain multiple `<style>` tags.

- A `<style>` tag can have `scoped` or `module` attributes (see [Scoped CSS](./guide/scoped-css.md) and [CSS Modules](./guide/css-modules.md)) to help encapsulate the styles to the current component. Multiple `<style>` tags with different encapsulation modes can be mixed in the same component.

- Any webpack rules that match against `.css` files (or the extension specified by the `lang` attribute) will be applied to contents in the `<style>` blocks as well.

### Custom Blocks

Additional custom blocks can be included in a `*.vue` file for any project specific needs, for example a `<docs>` block. `vue-loader` will use the tag name to look up which webpack loaders should be applied to the contents of the section. The webpack loaders should be specified in the `loaders` section of `vue-loader` options.

For mode details, see [Custom Blocks](./guide/custom-blocks.md).

### Src Imports

If you prefer splitting up your `*.vue` components into multiple files, you can use the `src` attribute to import an external file for a language block:

``` vue
<template src="./template.html"></template>
<style src="./style.css"></style>
<script src="./script.js"></script>
```

Beware that `src` imports follow the same path resolution rules to webpack module requests, which means:

- Relative paths need to start with `./`
- You can import resources from npm dependencies:

``` vue
<!-- import a file from the installed "todomvc-app-css" npm package -->
<style src="todomvc-app-css/index.css">
```

`src` imports also work with custom blocks, e.g.:

``` vue
<unit-test src="./unit-test.js">
</unit-test>
```

## Syntax Highlighting / IDE Support

Currently there is syntax highlighting support for the following IDE/editors:

- [Sublime Text](https://github.com/vuejs/vue-syntax-highlight)
- [VS Code](https://marketplace.visualstudio.com/items?itemName=octref.vetur)
- [Atom](https://atom.io/packages/language-vue)
- [Vim](https://github.com/posva/vim-vue)
- [Emacs](https://github.com/AdamNiederer/vue-mode)
- [Brackets](https://github.com/pandao/brackets-vue)
- [JetBrains IDEs](https://plugins.jetbrains.com/plugin/8057) (WebStorm, PhpStorm, etc)

Contributions for other editors/IDEs are highly appreciated! If you are not using any pre-processors in Vue components, you can also get decent syntax highlighting by treating `*.vue` files as HTML in your editor.

## Comments

Inside each block you shall use the comment syntax of the language being used (HTML, CSS, JavaScript, Jade, etc). For top-level comments, use HTML comment syntax: `<!-- comment contents here -->`

