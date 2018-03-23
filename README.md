# vue-loader@next

This is the WIP branch of the next version of `vue-loader`. It uses a fairly different new architecture that is able to apply whatever rules defined in the main webpack config to the language blocks inside a `*.vue` file.

## Example Usage

``` js
// webpack.config.js
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'development',
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

`vue-loader` 15 now infers loaders to use for language blocks a bit differently.

Take `<style lang="less">` as an example: in v14 and below, it will attempt to load the block with `less-loader`, and implicitly chains `css-loader` and `vue-style-loader` after it, all using inline loader strings.

In v15, `<style lang="less">` will behave as if it's an actual `*.less` file being loaded. So, in order to process it, you need to provide an explicit rule in your main webpack config:

``` js
{
  module: {
    rules: [
      // ...other rules
      {
        test: /\.less$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'less-loader'
        ]
      }
    ]
  }
}
```

The benefit is that this same rule also applies to plain `*.less` imports from JavaScript, and you can configure options for these loaders anyway you want. In v14 and below, if you want to provide custom options to an inferred loader, you'd have to duplicate it under `vue-loader`'s own `loaders` option. In v15 it is no longer necessary.

v15 also allows using non-serializable options for loaders, which was not possible in previous versions.

### Style Injection

Client-side style injection now injects all styles upfront to ensure consistent behavior between development and extracted mode.

Note the injection order is still not guaranteed, so you should avoid writing CSS that relies on insertion order.

### PostCSS

`vue-loader` no longer auto applies PostCSS transforms. To use PostCSS, configure `postcss-loader` the same way you would for normal CSS files.

### CSS Modules

CSS Modules now need to be explicitly configured via `css-loader` options. The `module` attribute on `<style>` tags is still needed for locals injection into the component.

The good news is that you can now configure `localIdentName` in one place:

``` js
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'vue-style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]_[hash:base64:8]'
            }
          }
        ]
      }
    ]
  }
}
```

If you only want to use CSS Modules in some of your Vue components, you can use a `oneOf` rule and check for the `module` string in resourceQuery:

``` js
{
  test: /\.css$/,
  oneOf: [
    // this matches <style module>
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

## CSS Extraction

Works the same way as you'd configure it for normal CSS. Example usage with [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin):

``` js
{
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.css$/,
        // or ExtractTextWebpackPlugin.extract(...)
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'output.css'
    })
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
- `transpileOptions`
- `transformAssetUrls`
- `optimizeSSR`
- `hotReload`
- `productionMode`
