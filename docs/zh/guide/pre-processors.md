---
sidebarDepth: 2
---

# 使用预处理器

在 webpack 中，所有的预处理器需要匹配对应的 loader。Vue Loader 允许你使用其它 webpack loader 处理 Vue 组件的某一部分。它会根据 `lang` 特性以及你 webpack 配置中的规则自动推断出要使用的 loader。

## Sass

例如，为了通过 Sass/SCSS 编译我们的 `<style>` 标签：

``` bash
npm install -D sass-loader node-sass
```

在你的 webpack 配置中：

``` js
module.exports = {
  module: {
    rules: [
      // ... 忽略其它规则

      // 普通的 `.scss` 文件和 `*.vue` 文件中的
      // `<style lang="scss">` 块都应用它
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
  // 插件忽略
}
```

现在，除了能够 `import 'style.scss'`，我们还可以在 Vue 组件中使用 SCSS：

``` html
<style lang="scss">
/* 在这里撰写 SCSS */
</style>
```

这个块里的任何内容都会被 webpack 当作在一个 `*.scss` 文件中一样被处理。

### Sass vs SCSS

注意 `sass-loader` 会默认处理不基于缩进的 `scss` 语法。为了使用基于缩进的 `sass` 语法，你需要向这个 loader 传递选项：

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

### 共享全局变量

`sass-loader` 也支持一个 `data` 选项，这个选项允许你在所有被处理的文件之间共享常见的变量，而不需要显式地导入它们：

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
        // 你也可以从一个文件读取，例如 `variables.scss`
        data: `$color: red;`
      }
    }
  ]
}
```

## Less

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
Vue Loader v15 不再默认应用 PostCSS 变换。你需要通过 `postcss-loader` 使用 PostCSS。
:::

``` bash
npm install -D postcss-loader
```

``` js
// webpack.config.js -> module.rules
{
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: { importLoaders: 1 }
    },
    'postcss-loader'
  ]
}
```

PostCSS 的配置可以通过 `postcss.config.js` 或 `postcss-loader` 选项来完成。其更多细节请查阅 [postcss-loader 文档](https://github.com/postcss/postcss-loader)。

`postcss-loader` 也可以和上述其它预处理器结合使用。

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

Babel 的配置可以通过 `.babelrc` 或 `babel-loader` 选项来完成。

## TypeScript

``` bash
npm install -D typescript ts-loader
```

``` js
// webpack.config.js
module.exports = {
  resolve: {
    // 将 `.ts` 添加为一个可解析的扩展名。
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      // ... 忽略其它规则
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { appendTsSuffixTo: [/\.vue$/] }
      }
    ]
  },
  // ...plugin omitted
}
```

TypeScript 的配置可以通过 `tsconfig.json` 来完成。你也可以查阅 [ts-loader](https://github.com/TypeStrong/ts-loader) 的文档。

## Pug

模板的处理会稍微有些不同，因为绝大对数 webpack 的模板类 loader，诸如 `pug-loader`，会返回一个模板函数而不是一个编译好的 HTML 字符串。所以我们需要使用一个返回原始的 HTML 字符串的 loader，例如 `pug-plain-loader`，而不是使用 `pug-loader`。

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

然后你可以写：

``` html
<template lang="pug">
div
  h1 Hello world!
</template>
```

如果你还打算使用它在 JavaScript 中将 `.pug` 文件作为字符串导入，你需要在这个预处理 loader 之后链上 `raw-loader`。注意添加 `raw-loader` 会破坏 Vue 组件内的用法，所以你需要定义两条规则，其中一条指向使用了一个 `resourceQuery` 的 Vue 文件，另一条指向 (回退到) JavaScript 导入：

``` js
// webpack.config.js -> module.rules
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
```
