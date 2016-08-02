# Getting Started

### Syntax Highlighting

First thing first, you will probably want proper syntax highlighting for `*.vue` components. Currently there are syntax highlighting support for [Sublime Text](https://github.com/vuejs/vue-syntax-highlight), [Atom](https://atom.io/packages/language-vue) and [Vim](https://github.com/posva/vim-vue). Contributions for other editors/IDEs are highly appreciated! If you are not using any pre-processors in Vue components, you can also get by by treating `*.vue` files as HTML in your editor.

### Project Structure

We are going to walk through setting up a Webpack + `vue-loader` project from scratch. If you are interested in ready-to-run examples, check out [vue-loader-example](https://github.com/vuejs/vue-loader-example) and [vue-hackernews](https://github.com/vuejs/vue-hackernews). However, if you are not already a Webpack expert, I highly recommend going through the following tutorial to understand how the pieces fit together.

A simple `vue-loader` based project structure looks like this:

``` bash
.
├── index.html
├── main.js
├── components
│   ├── App.vue
│   ├── ComponentA.vue
│   └── ComponentB.vue
├── package.json
└── webpack.config.js
```

### Installing Dependencies

Before we write any code, we need to install the proper NPM dependencies. Let's run:

``` bash
# Create a package.json file.
# fill in the questions as you desire.
npm init

# Install everything we need
npm install\
  webpack webpack-dev-server\
  vue-loader vue-html-loader css-loader style-loader vue-hot-reload-api\
  babel-loader babel-core babel-plugin-transform-runtime babel-preset-es2015\
  babel-runtime@5\
  --save-dev
```

That's a lot of dependencies, I know! This is mostly because `vue-loader` need to have other webpack loaders as **peer dependencies** rather than nested dependencies so that Webpack can find them.[^(1)]

You may also notice that we are using `babel-runtime` version 5 instead of the latest 6.x - this is [intentional](https://github.com/vuejs/vue-loader/issues/96#issuecomment-162910917).

After proper installation, your `package.json`'s `devDependencies` field should look like this:

``` json
...
  "devDependencies": {
    "babel-core": "^6.3.17",
    "babel-loader": "^6.2.0",
    "babel-plugin-transform-runtime": "^6.3.13",
    "babel-preset-es2015": "^6.3.13",
    "babel-runtime": "^5.8.34",
    "css-loader": "^0.23.0",
    "style-loader": "^0.13.0",
    "vue-hot-reload-api": "^1.2.2",
    "vue-html-loader": "^1.0.0",
    "vue-loader": "^7.2.0",
    "webpack": "^1.12.9",
    "webpack-dev-server": "^1.14.0"
  },
...
```

### Configuring Webpack

Here's the most basic Webpack configuration for `vue-loader`:

``` js
// webpack.config.js
module.exports = {
  // entry point of our application
  entry: './main.js',
  // where to place the compiled bundle
  output: {
    path: __dirname,
    filename: 'build.js'
  },
  module: {
    // `loaders` is an array of loaders to use.
    // here we are only configuring vue-loader
    loaders: [
      {
        test: /\.vue$/, // a regex for matching all files that end in `.vue`
        loader: 'vue'   // loader to use for matched files
      }
    ]
  }
}
```

With the above configuration, when you write the following in your JavaScript code:

``` js
var MyComponent = require('./my-component.vue')
```

Webpack knows it needs to pipe the contents of `./my-component.vue` through `vue-loader`, because the filename matches the regex we provided in the config.

### Creating Other Files

The app entry point, `main.js` typically looks like this:

``` js
// main.js
var Vue = require('vue')
// require a *.vue component
var App = require('./components/App.vue')

// mount a root Vue instance
new Vue({
  el: 'body',
  components: {
    // include the required component
    // in the options
    app: App
  }
})
```

Inside a `*.vue` component's `<script>` tag, you can also require other `*.vue` components. For example in `./components/App.vue` (we will talk about ES2015 later):

``` html
<template>
  <div class="app">
    <component-a></component-a>
    <component-b></component-b>
  </div>
</template>

<script>
module.exports = {
  components: {
    'component-a': require('./ComponentA.vue'),
    'component-b': require('./ComponentB.vue')
  }
}
</script>
```

Next, let's create an `index.html` that simply uses the bundled file:

``` html
<!-- index.html -->
<body>
  <app></app>
  <script src="build.js"></script>
</body>
```

### Running It

Finally, it's time to get it running! We will simply use [NPM scripts](https://docs.npmjs.com/misc/scripts) as our task runner, which is sufficient in most cases. Add the following to your `package.json`:

``` json
...
"scripts": {
  "dev": "webpack-dev-server --inline --hot"
}
...
```

Then run:

``` bash
npm run dev
```

And you should see your app working at `http://localhost:8080`, with hot-reloading enabled!

---

[^(1)] If you are using NPM version 2.x, when you do `npm install vue-loader --save-dev` it will install and save all the peer dependencies for you. However, if you are using NPM 3.x, these peer dependencies will no longer be automatically installed. You will have to install them explicitly like we did above. Another way to deal with it is to simply copy `vue-loader`'s peer dependencies into your `package.json`'s `devDependencies` field and then run `npm install`.
