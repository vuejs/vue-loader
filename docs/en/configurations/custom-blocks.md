# Custom Blocks

> Requires 10.2.0+

You can define custom language blocks inside `*.vue` files. The content of a custom block will be processed by the loaders specified in the `loaders` object of `vue-loader` options and then required by the component module. The configuration is similar to what is described in [Advanced Loader Configuration](../configurations/advanced.md), except the matching uses the tag name instead of the `lang` attribute.

If a matching loader is found for a custom block, it will be processed; otherwise the custom block will simply be ignored. Additionally, if the found loader returns a function, that function will be called with the component of the `*.vue` file as a parameter.

## Single docs file example

Here's an example of extracting all `<docs>` custom blocks into a single docs file:

#### component.vue

``` html
<docs>
## This is an Example component.
</docs>

<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>

<style>
comp-a h2 {
  color: #f00;
}
</style>
```

#### webpack.config.js

``` js
// webpack 2.x
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // extract all <docs> content as raw text
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ]
  },
  plugins: [
    // output all docs into a single file
    new ExtractTextPlugin('docs.md')
  ]
}
```

## Runtime available docs

> Requires 11.3.0+

Here's an example of injecting the `<docs>` custom blocks into the component so that it's available during runtime.

#### docs-loader.js

In order for the custom block content to be injected, we'll need a custom loader:

``` js
module.exports = function (source, map) {
  this.callback(null, 'module.exports = function(Component) {Component.options.__docs = ' +
    JSON.stringify(source) +
    '}', map)
}
```

#### webpack.config.js

Now we'll configure webpack to use our custom loader for `<docs>` custom blocks.

``` js
const docsLoader = require.resolve('./custom-loaders/docs-loader.js')

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'docs': docsLoader
          }
        }
      }
    ]
  }
}
```

#### component.vue

We are now able to access the `<docs>` block's content of imported components during runtime.

``` html
<template>
  <div>
    <component-b />
    <p>{{ docs }}</p>
  </div>
</template>

<script>
import componentB from 'componentB';

export default = {
  data () {
    return {
      docs: componentB.__docs
    }
  },
  components: {componentB}
}
</script>
```
