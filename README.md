# vue-loader@next

This is the WIP branch of the next version of `vue-loader`. It uses a fairly different new architecture that is able to apply whatever rules defined in the main webpack config to the language blocks inside a `*.vue` file.

## Example Usage

``` js
// webpack.config.js
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './main.js'),
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // this will apply to both plain .js files
      // AND <script> blocks in vue files
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      // this will apply to both plain .css files
      // AND <style> blocks in vue files
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      // this will apply to both plain .scss files
      // AND <style lang="scss"> blocks in vue files
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              data: '$color: red;'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin()
  ]
}
```

## Notable Breaking Changes

### Loader Inference

`vue-loader` 15 no longer infers the loader to use based on the `lang` attribute. Instead, the plugin dynamically creates rules that clones your existing config and maps them to vue language block requests. So, in the new version, in order to use SASS loader, you will need to explicitly configure the loader to use like in the example above.

The benefit is now your plain SASS imports from JavaScript and all `<style lang="scss">` code inside Vue components share exactly the same loaders and options. In the past, if `vue-loader`'s default behavior doesn't match your needs, you'd have to duplicate the config using `vue-loader`'s own `loaders` option, but now it is no longer needed.

### Style Injection

Client-side style injection now injects all styles upfront to ensure consistent behavior between development and extracted mode.

Note the injection order is still not guaranteed, so you should avoid writing CSS that relies on insertion order.

### CSS Modules

CSS Modules now need to be explicitly configured in main webpack config's `css-loader` options. The `module` attribute on `<style>` tags are still needed for locals injection into the component.

The good news is that you can now configure `localIdentName` in one place.

If you still want the ability to only use CSS Modules in some of your Vue components, you can use a `oneOf` rule and check for the `cssModules` string in resourceQuery:

``` js
{
  test: /\.css$/,
  oneOf: [
    // this matches <style module>
    {
      resourceQuery: /cssModules/,
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
    // this matches plain <style> or <style scoped>
    {
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }
  ]
}
```

## Options Deprecation

The following options have been deprecated and should be configured using normal webpack module rules:

- `loader`
- `preLoaders`
- `postLoaders`
- `postcss`
- `cssSourceMap`
- `buble`
- `extractCSS`

The following options have been deprecated and should be configured using the new `compilerOptions` option:

- `compilerModules`
- `compilerDirectives`

The following option has been renamed:

- `transformToRequire` (now renamed to `transformAssetUrls`)

The following option has been changed to resourceQuery:

- `shadowMode` (now use inline resource queries)

## New Complete Options List

- `compiler`
- `compilerOptions`
- `transformAssetUrls`
- `optimizeSSR`
- `hotReload`
