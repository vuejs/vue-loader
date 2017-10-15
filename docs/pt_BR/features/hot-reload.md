# Hot Reload

"Hot Reload" \(Recarga Automática\) não é simplesmente recarregar a página quando você editar um arquivo. Com hot reload ativado, quando você edita um arquivo `*.vue`, todas as instâncias desse componente serão trocadas **sem recarregar a página**. Ele ainda preserva o estado atual de sua aplicação e dos componentes trocados. Isto melhora drasticamente a experiência de desenvolvimento quando você está ajustando os modelos ou estilo de seus componentes.

![hot-reload](http://blog.evanyou.me/images/vue-hot.gif)

## State Preservation Rules

- When editing the `<template>` of a component, instances of the edited component will re-render in place, preserving all current private state. This is possible because templates are compiled into new render functions that produce no side-effects.

- When editing the `<script>` part of a component, instances of the edited component will be destroyed and re-created in place. (State of the other components in the app are preserved) This is because `<script>` can include lifecycle hooks that may produce side-effects, so a "reload" instead of re-render is required to ensure consistent behavior. This also means you need to be careful about global side effects such as timers inside your components lifecycle hooks. Sometimes you may need to do a full-page reload if your component produces global side-effects.

- `<style>` hot reload operates on its own via `vue-style-loader`, so it doesn't affect application state.

## Usage

Quando o esqueleto do projeto é criado com `vue-cli`, Hot Reload é ativado e pronto para o uso.

When manually setting up your project, hot-reload is enabled automatically when you serve your project with `webpack-dev-server --hot`.

Advanced users may want to check out [vue-hot-reload-api](https://github.com/vuejs/vue-hot-reload-api), which is used internally by `vue-loader`.
