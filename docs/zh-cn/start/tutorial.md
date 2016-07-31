# 基础指南

接下来，我们会从零开始，逐步搭建一个 Webpack + `vue-loader` 的项目。如果你对准备好的运行例子感兴趣，查看 [vue-cli](https://github.com/vuejs/vue-cli)，借助脚手架快速搭建新项目。不过，如果你不是 Webpack 老司机，我还是非常建议您接着看下面教程，然后理解各部分是怎么配合工作的。

### 项目结构

一个基于 `vue-loader` 的简单项目大概长这样：

``` bash
.
├── index.html
├── main.js
├── components
│   ├── App.vue
│   ├── ComponentA.vue
│   └── ComponentB.vue
├── package.json
└── webpack.config.js
```

### 安装依赖

在我们敲代码之前，需要安装相应的 NPM 依赖包。我们可以运行：

``` bash
# 该命令会创建一个 package.json 文件。
# 根据你的需求对提示的问题填写回答就行
npm init

# 安装所需的一切
npm install\
  webpack webpack-dev-server\
  vue-loader vue-html-loader css-loader vue-style-loader vue-hot-reload-api\
  babel-loader babel-core babel-plugin-transform-runtime babel-preset-es2015\
  babel-runtime\
  --save-dev
npm install vue --save
```

我知道这里确实不少依赖！主要原因是 `vue-loader` 需要把其他 webpack loader 作为 **同级依赖**，而不是深层依赖，这样 Webpack 才能能够找到它们。[^(1)]

> 注意: `vue-loader` 的上个版本，我们通过明确安装 `babel-runtime` 5.x 版本来避免重复依赖 —— 在最近 babel 升级之后，这将不是必须的。

在正确安装依赖后，你的 `package.json` 的 `devDependencies` 字段应该长这样：

``` json
...
  "devDependencies": {
    "babel-core": "^6.3.17",
    "babel-loader": "^6.2.0",
    "babel-plugin-transform-runtime": "^6.3.13",
    "babel-preset-es2015": "^6.3.13",
    "babel-runtime": "^5.8.34",
    "css-loader": "^0.23.0",
    "vue-hot-reload-api": "^1.2.2",
    "vue-html-loader": "^1.0.0",
    "vue-style-loader": "^1.0.0",
    "vue-loader": "^7.2.0",
    "webpack": "^1.12.9",
    "webpack-dev-server": "^1.14.0"
  },
  "dependencies": {
    "vue": "^1.0.13"
  },
...
```

### 配置 Webpack

下面是 `vue-loader` 最基本的 Webpack 配置：

``` js
// webpack.config.js
module.exports = {
  // 应用的入口
  entry: './main.js',
  // 编译打包后的输出
  output: {
    path: __dirname,
    filename: 'build.js'
  },
  module: {
    // `loaders` 是需要用到的 loader 组成的数组
    // 这里只配置 vue-loader
    loaders: [
      {
        test: /\.vue$/, // 正则匹配所有以 `.vue` 结尾的文件
        loader: 'vue'   // 对匹配到的文件使用何种 loader
      }
    ]
  }
}
```

有了上面的配置，当你像下面这样写 JavaScript 代码的时候：

``` js
var MyComponent = require('./my-component.vue')
```

Webpack 知道它需要把 `./my-component.vue` 的内容连接（pipe）到 `vue-loader`，因为文件名符合配置中的正则表达式。

### 创建其他文件

应用的入口 `main.js` 通常长这样（使用 ES2015 语法）：

``` js
// main.js
import Vue from 'vue'
// 依赖一个 *.vue 组件
import App from './components/App'

// 挂载 Vue 根实例
new Vue({
  el: 'body',
  components: {
    // 在配置中包含依赖的组件
    app: App
  }
})
```

你可以在 `*.vue` 组件的 `<script>` 标签里，依赖多个其它 `*.vue` 组件。例如在 `./components/App.vue` 中：

``` html
<template>
  <div class="app">
    <component-a></component-a>
    <component-b></component-b>
  </div>
</template>

<script>
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

export default {
  components: {
    ComponentA,
    ComponentB
  }
}
</script>
```

接下来，我们新建一个 `index.html` 文件，简单的使用打包生成的文件：

``` html
<!-- index.html -->
<body>
  <app></app>
  <script src="build.js"></script>
</body>
```

### 运行

最后来运行它！我们用简单的 [NPM scripts](https://docs.npmjs.com/misc/scripts) 作任务运行，大多数情况也够用了。把下面代码添加到 `package.json` 中：


``` json
...
"scripts": {
  "dev": "webpack-dev-server --inline --hot",
  "build": "webpack -p"
}
...
```

然后运行：

``` bash
npm run dev
```

接着打开 `http://localhost:8080`，能看到你的应用跑起来了，还带热加载呢！想要构建、压缩，并将打包文件写入磁盘，则运行：

``` bash
npm run build
```

要注意的是，Webpack 默认找到 `webpack.config.js` ，把它当作配置文件。如果你的 Webpack 配置文件用别的命名，则需要通过命令行参数 `--config /你的/文件/路径` 来指定配置文件。

---

[^(1)] 如果你用 NPM 2.x 版本，当运行 `npm install vue-loader --save-dev` 时，它会安装保存所有的同级依赖。但是，如果你用的 NPM 是 3.x 版本的，那么这些同级依赖将不再自动安装了，你必须得像上面那样明确安装它们。另一种简单的处理方式就是，复制 `vue-loader` 的同级依赖到你的 `package.json` 文件的 `devDependencies` 字段，然后运行 `npm install`。
