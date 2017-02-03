# Custom Blocks

> Requires 10.2.0+

You can define custom language blocks inside `*.vue` files. The content of a custom block will be processed by the loaders specified in the `loaders` object of `vue-loader` options and then required by the component module. The configuration is similar to what is described in [Advanced Loader Configuration](../configurations/advanced.md), except the matching uses the tag name instead of the `lang` attribute.

If a matching loader is found for a custom block, it will be processed; otherwise the custom block will simply be ignored.

## Example

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
// Webpack 2.x
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          loaders: {
            // extract all <docs> content as raw text
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ],
    plugins: [
      // output all docs into a single file
      new ExtractTextPlugin('docs.md')
    ]
  }
}
```
