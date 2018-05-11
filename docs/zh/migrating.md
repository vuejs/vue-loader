---
sidebar: auto
sidebarDepth: 2
---

# 从 v14 迁移

::: tip 注意
我们正在升级 Vue CLI 3 beta 的过程中，并使用了 webpack 4 + Vue Loader 15，所以如果你计划升级到 Vue CLI 3 的话，可能需要等待。
:::

## 值得注意的不兼容变更

### 现在你需要一个插件

Vue Loader 15 现在需要配合一个 webpack 插件才能正确使用：

``` js
// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  // ...
  plugins: [
    new VueLoaderPlugin()
  ]
}
```

### Loader 推导

现在 Vue Loader 15 使用了一个不一样的策略来推导语言块使用的 loader。

拿 `<style lang="less">` 举例：在 v14 或更低版本中，它会尝试使用 `less-loader` 加载这个块，并在其后面隐式地链上 `css-loader` 和 `vue-style-loader`，这一切都使用内联的 loader 字符串。

在 v15 中，`<style lang="less">` 会完成把它当作一个真实的 `*.less` 文件来加载。因此，为了这样处理它，你需要在你的主 webpack 配置中显式地提供一条规则：

``` js
{
  module: {
    rules: [
      // ... 其它规则
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

这样做的好处是这条规则同样应用在 JavaScript 里普通的 `*.less` 导入中，并且你可以为这些 loader 配置任何你想要的选项。在 v14 或更低版本中，如果你想为一个推导出来的 loader 定制选项，你不得不在 Vue Loader 自己的 `loaders` 选项中将它重复一遍。在 v15 中你再也没有必要这么做了。

v15 也允许为 loader 使用非序列化的选项，这种选项在之前的版本中是无法使用的。

### 模板预处理

v14 或更低版本使用 [consolidate](https://github.com/tj/consolidate.js/) 来编译 `<template lang="xxx">`。v15 现在取而代之的是使用 webpack loader 为它们应用预处理器。

注意有些模板的 loader 会导出一个编译好的模板函数而不是普通的 HTML，诸如 `pug-loader`。为了向 Vue 的模板编译器传递正确的内容，你必须换用一个输出普通 HTML 的 loader。例如，为了支持 `<template lang="pug">`，你可以使用 [pug-plain-loader](https://github.com/yyx990803/pug-plain-loader)：

``` js
{
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
      }
    ]
  }
}
```

如果你还打算使用它在 JavaScript 中将 `.pug` 文件作为字符串导入，你需要在这个预处理 loader 之后链上 `raw-loader`。注意添加 `raw-loader` 会破坏 Vue 组件内的用法，所以你需要定义两条规则，其中一条指向使用了一个 `resourceQuery` 的 Vue 文件，另一条指向 (回退到) JavaScript 导入：

``` js
{
  module: {
    rules: [
      {
        test: /\.pug$/,
        oneOf: [
          // 这条规则应用到 Vue 组件内的 `<template lang="pug">`
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader']
          },
          // 这条规则应用到 JavaScript 内的 pug 导入
          {
            use: ['raw-loader', 'pug-plain-loader']
          }
        ]
      }
    ]
  }
}
```

### 样式注入

现在客户端的样式注入会在最前面注入所有的样式以确保开发模式和提取模式下行为的一致性。

注意它们注入的顺序是不能保证的，所以你撰写的 CSS 应该避免依赖插入的顺序。

### PostCSS

Vue Loader v15 不再默认应用 PostCSS 变换。想要使用 PostCSS，请像配置普通 CSS 文件那样配置 `postcss-loader`。

### CSS Modules

CSS Modules 现在需要通过 `css-loader` 选项显式地配置。`<style>` 标签上的 `module` 特性仍然需要用来局部注入到组件中。

好消息是你现在可以在同一处配置 `localIdentName` 了：

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

如果你只想在某些 Vue 组件中使用 CSS Modules，你可以使用 `oneOf` 规则并在 `resourceQuery` 字符串中检查 `module` 字符串：

``` js
{
  test: /\.css$/,
  oneOf: [
    // 这里匹配 `<style module>`
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
    // 这里匹配普通的 `<style>` 或 `<style scoped>`
    {
      use: [
        'vue-style-loader',
        'css-loader'
      ]
    }
  ]
}
```

## CSS 提取

用法和你为普通 CSS 的配置一样。示例用法在 [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)：

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
        // 或 `ExtractTextWebpackPlugin.extract(...)`
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

## 服务端渲染的依赖排除

在服务端渲染中，我们通常使用 `webpack-node-externals` 来从服务端构建中排除 npm 依赖。如果你需要从一个 npm 依赖导入 CSS，之前的方案是使用像这样的一个白名单：

``` js
// webpack 配置
externals: nodeExternals({
  whitelist: /\.css$/
})
```

使用 v15，导入 `<style src="dep/foo.css">` 现在会在请求的末尾追加 resourceQuery 字符串，所以你需要将上述内容更新为：

``` js
externals: nodeExternals({
  whitelist: [/\.css$/, /\?vue&type=style/]
})
```

## 废弃的选项

下列选项已经被废弃了，它们应该使用普通的 webpack 模块的规则来配置：

- `loader`
- `preLoaders`
- `postLoaders`
- `postcss`
- `cssSourceMap`
- `buble`
- `extractCSS`
- `template`

下列选项已经被废弃了，它们应该使用新的 `compilerOptions` 选项来配置：

- `preserveWhitespace` (使用 `compilerOptions.preserveWhitespace`)
- `compilerModules` (使用 `compilerOptions.modules`)
- `compilerDirectives` (使用 `compilerOptions.directives`)

下列选项已经被改名了：

- `transformToRequire` (现在改名为 `transformAssetUrls`)

下列选项已经被改为 `resourceQuery`：

- `shadowMode` (现在使用内联资源查询语句，例如 `foo.vue?shadow`)

:::tip
想查阅新选项的完整列表，请移步[选项参考](./options.md)。
:::
