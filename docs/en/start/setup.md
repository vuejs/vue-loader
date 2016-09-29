# Setting Up a Project

### Syntax Highlighting

First thing first, you will probably want proper syntax highlighting for `*.vue` components. Currently there are syntax highlighting support for [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue) and [Vim](https://github.com/posva/vim-vue). Contributions for other editors/IDEs are highly appreciated! If you are not using any pre-processors in Vue components, you can also get by by treating `*.vue` files as HTML in your editor.

### Using `vue-cli`

It's recommended to scaffold a project using `vue-loader` with `vue-cli`:

``` bash
npm install -g vue-cli
vue init webpack-simple hello-vue
cd hello-vue
npm install
npm run dev # ready to go!
```
