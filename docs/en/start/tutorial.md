# Basic Tutorial

We are going to walk through setting up a Webpack + `vue-loader` project from scratch. If you are interested in ready-to-run examples, check out [vue-cli](https://github.com/vuejs/vue-cli) to quickly scaffold new projects. However, if you are not already a Webpack expert, I highly recommend going through the following tutorial to understand how the pieces fit together.

### Project Structure

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
  vue-loader vue-html-loader css-loader vue-style-loader vue-hot-reload-api\
  babel-loader babel-core babel-plugin-transform-runtime babel-preset-es2015\
  babel-runtime\
  --save-dev
npm install vue --save
```

That's a lot of dependencies, I know! This is mostly because `vue-loader` need to have other webpack loaders as **peer dependencies** rather than nested dependencies so that Webpack can find them.[^(1)]

> Note: In previous versions of `vue-loader` we used to explicitly install `babel-runtime` 5.x to avoid duplicate dependencies - this is no longer necessary after recent babel upgrade.

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
    "vue-hot-reload-api": "^1.2.2",
    "vue-html-loader": "^1.0.0",
    "vue-style-loader": "^1.0.0",
    "vue-loader": "^7.2.0",
    "webpack": "^1.12.9",
    "webpack-dev-server": "^1.14.0"
  },
  "dependencies": {
    "vue": "^1.0.13"
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

The app entry point, `main.js` typically looks like this (using ES2015 syntax):

``` js
// main.js
import Vue from 'vue'
// require a *.vue component
import App from './components/App'

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

Inside a `*.vue` component's `<script>` tag, you can also require other `*.vue` components. For example in `./components/App.vue`:

``` html
<template>
  <div class="app">
    <component-a></component-a>
    <component-b></component-b>
  </div>
</template>

<script>
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

export default {
  components: {
    ComponentA,
    ComponentB
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
  "dev": "webpack-dev-server --inline --hot",
  "build": "webpack -p"
}
...
```

Then run:

``` bash
npm run dev
```

And you should see your app working at `http://localhost:8080`, with hot-reloading enabled! To build, minify and write your bundle to disk, run:

``` bash
npm run build
```

Note that Webpack uses the `webpack.config.js` if it finds one. If you named your Webpack config file with a different name, you need to specify it using the `--config /path/to/your/file` command line option.

---

[^(1)] If you are using NPM version 2.x, when you do `npm install vue-loader --save-dev` it will install and save all the peer dependencies for you. However, if you are using NPM 3.x, these peer dependencies will no longer be automatically installed. You will have to install them explicitly like we did above. Another way to deal with it is to simply copy `vue-loader`'s peer dependencies into your `package.json`'s `devDependencies` field and then run `npm install`.
