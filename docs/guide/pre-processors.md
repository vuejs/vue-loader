---
sidebarDepth: 2
---

# Using Pre-Processors

In webpack, all pre-processors need to be applied with a corresponding loader. `vue-loader` allows you to use other webpack loaders to process a part of a Vue component. It will automatically infer the proper loaders to use based on the `lang` attribute of a language block and the rules in your webpack config.

## SASS

For example, to compile our `<style>` tag with SASS/SCSS:

``` bash
npm install -D sass-loader node-sass
```

In your webpack config:

``` js
module.exports = {
  module: {
    rules: [
      // ... other rules omitted

      // this will apply to both plain `.scss` files
      // AND `<style lang="scss">` blocks in `.vue` files
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  // plugin omitted
}
```

Now in addition to being able to `import 'style.scss'`, we can use SCSS in Vue components as well:

``` html
<style lang="scss">
/* write SCSS here */
</style>
```

Any content inside the block will be processed by webpack as if it's inside a `*.scss` file.

### SASS vs SCSS

Note that `sass-loader` processes the non-indent-based `scss` syntax by default. In order to use the indent-based `sass` syntax, you need to pass options to the loader:

``` js
// webpack.config.js -> module.rules
{
  test: /\.sass$/,
  use: [
    'vue-style-loader',
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        indentedSyntax: true
      }
    }
  ]
}
```

### Sharing Global Variables

`sass-loader` also supports a `data` option which allows you to share common variables among all processed files without having to explicit import them:

``` js
// webpack.config.js -> module.rules
{
  test: /\.scss$/,
  use: [
    'vue-style-loader',
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        // you can also read from a file, e.g. `variables.scss`
        data: `$color: red;`
      }
    }
  ]
}
```

## LESS

``` bash
npm install -D less less-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.less$/,
  use: [
    'vue-style-loader',
    'css-loader',
    'less-loader'
  ]
}
```

## Stylus

``` bash
npm install -D stylus stylus-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.styl(us)?$/,
  use: [
    'vue-style-loader',
    'css-loader',
    'stylus-loader'
  ]
}
```

## PostCSS

::: tip
Vue Loader v15 no longer applies PostCSS transforms by default. You will need to use PostCSS via `postcss-loader`.
:::

``` bash
npm install -D postcss-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.css$/,
  use: [
    'vue-style-loader',
    {
      loader: 'css-loader',
      options: { importLoaders: 1 }
    },
    'postcss-loader'
  ]
}
```

Configuration of PostCSS can be done via `postcss.config.js` or `postcss-loader` options. For details, consult [postcss-loader docs](https://github.com/postcss/postcss-loader).

`postcss-loader` can also be applied in combination with other pre-processors mentioned above.

## Babel

``` bash
npm install -D babel-core babel-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.js?$/,
  loader: 'babel-loader'
}
```

Configuration of Babel can be done via `.babelrc` or `babel-loader` options.

### Excluding node_modules

It is common to have `exclude: /node_modules/` for JS transpilation rules (e.g. `babel-loader`) that apply to `.js` files. Due to the inference change of v15, if you import a Vue SFC inside `node_modules`, its `<script>` part will be excluded from transpilation as well.

In order to ensure JS transpilation is applied to Vue SFCs in `node_modules`, you need to whitelist them by using an exclude function instead:

``` js
{
  test: /\.js$/,
  loader: 'babel-loader',
  exclude: file => (
    /node_modules/.test(file) &&
    !/\.vue\.js/.test(file)
  )
}
```

## TypeScript

``` bash
npm install -D typescript ts-loader
```

``` js
// webpack.config.js
module.exports = {
  resolve: {
    // Add `.ts` as a resolvable extension.
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      // ... other rules omitted
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] }
      }
    ]
  },
  // ... plugin omitted
}
```

Configuration of TypeScipt can be done via `tsconfig.json`. Also see docs for [ts-loader](https://github.com/TypeStrong/ts-loader).

## Pug

Processing templates is a little different, because most webpack template loaders such as `pug-loader` return a template function instead of a compiled HTML string. Instead of using `pug-loader`, we need to use a loader that returns the raw HTML string, e.g. `pug-plain-loader`:

``` bash
npm install -D pug pug-plain-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.pug$/,
  loader: 'pug-plain-loader'
}
```

Then you can write:

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

If you also intend to use it to import `.pug` files as HTML strings in JavaScript, you will need to chain `raw-loader` after the preprocessing loader. Note however adding `raw-loader` would break the usage in Vue components, so you need to have two rules, one of them targeting Vue files using a `resourceQuery`, the other one (fallback) targeting JavaScript imports:

``` js
// webpack.config.js -> module.rules
{
  test: /\.pug$/,
  oneOf: [
    // this applies to `<template lang="pug">` in Vue components
    {
      resourceQuery: /^\?vue/,
      use: ['pug-plain-loader']
    },
    // this applies to pug imports inside JavaScript
    {
      use: ['raw-loader', 'pug-plain-loader']
    }
  ]
}
```
