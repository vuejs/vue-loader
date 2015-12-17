# Introduction

### What is `vue-loader`?

`vue-loader` is a loader for Webpack that can transform Vue components written in the following format into a plain JavaScript module:

![screenshot](http://blog.evanyou.me/images/vue-component.png)

There are many cool features provided by `vue-loader`:

- ES2015 enabled by default;
- Allows using other Webpack loaders for each part of a Vue component, for example SASS for `<style>` and Jade for `<template>`;
- Treat static assets referenced in `<style>` and `<template>` as module dependencies and handle them with Webpack loaders;
- Can simulate scoped CSS for each component;
- Supports component hot-reloading during development.

In a nutshell, the combination of Webpack and `vue-loader` gives you a modern, flexible and extremely powerful front-end workflow for authoring Vue.js applications.

### What is Webpack?

If you are already familiar with Webpack, feel free to skip the following explanation. But for those of you who are new to Webpack, here's a quick intro:

[Webpack](http://webpack.github.io/) is a module bundler. It takes a bunch of files, treating each as a module, figuring out the dependencies between them, and bundle them into static assets that are ready for deployment.

![webpack](http://webpack.github.io/assets/what-is-webpack.png)

For a basic example, imagine we have a bunch of CommonJS modules. They cannot run directly inside the browser, so we need to "bundle" them into a single file that can be included via a `<script>` tag. Webpack can follow the dependencies of the `require()` calls and do that for us.

But Webpack can do more than that. With "loaders", we can teach Webpack to transform all types of files in anyway we want before outputting the final bundle. Some examples include:

- Transpile ES2015, CoffeeScript or TypeScript modules into plain ES5 CommonJS modules;
- Optionally you can pipe the source code through a linter before doing the compilation;
- Transpile Jade templates into plain HTML and inline it as a JavaScript string;
- Transpile SASS files into plain CSS, then convert it into a JavaScript snippet that insert the resulting CSS as a `<style>` tag;
- Process an image file referenced in HTML or CSS, moved it to the desired destination based on the path configurations, and naming it using its md5 hash.

Webpack is so powerful that when you understand how it works, it can dramatically improve your front-end workflow. Its primary drawback is verbose and complex configuration; but with this guide you should be able to find solutions for most common issues when using Webpack with Vue.js and `vue-loader`.
