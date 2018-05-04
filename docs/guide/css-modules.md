# CSS Modules

[CSS Modules](https://github.com/css-modules/css-modules) is a popular system for modularizing and composing CSS. `vue-loader` provides first-class integration with CSS Modules as an alternative for simulated scoped CSS.

## Usage

First, CSS Modules must be enabled by passing `modules: true` to `css-loader`:

``` js
// webpack.config.js
{
  module: {
    rules: [
      // ... other rules omitted
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              // enable CSS Modules
              modules: true,
              // customize generated class names
              localIdentName: '[local]_[hash:base64:8]'
            }
          }
        ]
      }
    ]
  }
}
```

Then, add the `module` attribute to your `<style>`:

``` vue
<style module>
.red {
  color: red;
}
.bold {
  font-weight: bold;
}
</style>
```

The `module` attribute instructs Vue Loader to inject the CSS modules locals object into the component as a computed property with the name `$style`. You can then use it in your templates with a dynamic class binding:

``` vue
<template>
  <p :class="$style.red">
    This should be red
  </p>
</template>
```

Since it's a computed property, it also works with the object/array syntax of `:class`:

``` vue
<template>
  <div>
    <p :class="{ [$style.red]: isRed }">
      Am I red?
    </p>
    <p :class="[$style.red, $style.bold]">
      Red and bold
    </p>
  </div>
</template>
```

And you can also access it from JavaScript:

``` vue
<script>
export default {
  created () {
    console.log(this.$style.red)
    // -> "red_1VyoJ-uZ"
    // an identifier generated based on filename and className.
  }
}
</script>
```

Refer to the [CSS Modules spec](https://github.com/css-modules/css-modules) for mode details such as [global exceptions](https://github.com/css-modules/css-modules#exceptions) and [composition](https://github.com/css-modules/css-modules#composition).

## Opt-in Usage

If you only want to use CSS Modules in some of your Vue components, you can use a `oneOf` rule and check for the `module` string in `resourceQuery`:

``` js
// webpack.config.js -> module.rules
{
  test: /\.css$/,
  oneOf: [
    // this matches `<style module>`
    {
      resourceQuery: /module/,
      use: [
        'vue-style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[local]_[hash:base64:5]'
          }
        }
      ]
    },
    // this matches plain `<style>` or `<style scoped>`
    {
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }
  ]
}
```

## Using with Pre-Processors

CSS Modules can be used along with other pre-processors:

``` js
// webpack.config.js -> module.rules
{
  test: /\.scss$/,
  use: [
    'vue-style-loader',
    {
      loader: 'css-loader',
      options: { modules: true }
    },
    'sass-loader'
  ]
}
```

## Custom Inject Name

You can have more than one `<style>` tags in a single `*.vue` component. To avoid injected styles to overwrite each other, you can customize the name of the injected computed property by giving the `module` attribute a value:

``` html
<style module="a">
  /* identifiers injected as a */
</style>

<style module="b">
  /* identifiers injected as b */
</style>
```
