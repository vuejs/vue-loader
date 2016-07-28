# Production Build

There are two things to do when building our bundle for production:

1. Minify our application code;
2. Use the [setup described in the Vue.js guide](http://vuejs.org/guide/application.html#Deploying_for_Production) to strip all the warnings from Vue.js source code.

Here's an example config:

``` js
// webpack.config.js
module.exports = {
  // ... other options
  plugins: [
    // short-circuits all Vue.js warning code
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // minify with dead-code elimination
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // optimize module ids by occurence count
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}
```

Obviously we don't want to use this config during development, so there are several ways to approach this:

1. Dynamically build up the configuration object based on an environment variable;

2. Or, use two separate Webpack config files, one for development and one for production. And maybe share some common options between them in a third file, as shown in [vue-loader-example](https://github.com/vuejs/vue-loader-example/tree/master/build).

It's really up to you as long as it achieves the goal.
