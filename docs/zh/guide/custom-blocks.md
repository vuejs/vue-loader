# Custom Blocks

You can define custom language blocks inside `*.vue` files. Loaders applied for a custom block are matched based on the `lang` attribute of the block, the block's tag name, and the rules in your webpack config.

If a `lang` attribute is specified, the custom block will be matched as a file with the `lang` as its extension.

You can also use `resourceQuery` to match a rule against a custom block with no `lang`. For example, to match against `<foo>` custom blocks:

``` js
{
  module: {
    rules: [
      {
        resourceQuery: /blockType=foo/,
        loader: 'loader-to-use'
      }
    ]
  }
}
```

If a matching rule is found for a custom block, it will be processed; otherwise the custom block will be silently ignored.

Additionally, if the custom block exports a function as the final result after being processed by all the matching loaders, that function will be called with the component of the `*.vue` file as a parameter.

## Example

Here's an example of injecting the `<docs>` custom blocks into the component so that it's available during runtime.

In order for the custom block content to be injected, we'll write a custom loader:

``` js
module.exports = function (source, map) {
  this.callback(
    null,
    `export default function (Component) {
      Component.options.__docs = ${
        JSON.stringify(source)
      }
    }`,
    map
  )
}
```

Now we'll configure webpack to use our custom loader for `<docs>` custom blocks.

``` js
// wepback.config.js
module.exports = {
  module: {
    rules: [
      {
        resourceQuery: /blockType=docs/,
        loader: require.resolve('./docs-loader.js')
      }
    ]
  }
}
```

We are now able to access the `<docs>` block's content of imported components during runtime.

``` vue
<!-- ComponentB.vue -->
<template>
  <div>Hello</div>
</template>

<docs>
This is the documentation for component B.
</docs>
```

``` vue
<!-- ComponentA.vue -->
<template>
  <div>
    <ComponentB/>
    <p>{{ docs }}</p>
  </div>
</template>

<script>
import ComponentB from './ComponentB.vue';

export default = {
  components: { ComponentB },
  data () {
    return {
      docs: ComponentB.__docs
    }
  }
}
</script>
```
