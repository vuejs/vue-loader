# 热加载

"热加载" 不只是简单的重新加载修改后的文件。有了热加载之后，当你修改一个 `*.vue` 文件后，这个组件对应的所有实例都会换成新的，而且 **无须重新加载页面**，甚至还保持整个应用以及这些刷新组件的当前状态。

![hot-reload](http://blog.evanyou.me/images/vue-hot.gif)

### 开启热加载

要开启热加载，最简单的方式就是 [基础指南](../start/tutorial.md) 中稍微提到的：

``` js
// package.json
...
"scripts": {
  "dev": "webpack-dev-server --inline --hot"
}
...
```

这里假设访问项目根目录和访问其下的 `index.html` 是一样的。默认情况下，Webpack dev server 会使用当前工作目录作为内容的基目录，然后提供目录中所有静态文件的访问。

运行 `npm run dev` 然后通过 `http://localhost:8080` 访问静态应用。

### 热加载注意事项

- 当一个组件可以热加载时，它当前的状态是会保持的，不过组件本身是会销毁并重新创建的，所以，它的生命周期钩子方法都会相应被调用。要确保恰当地解除生命周期方法中产生的副作用。

- 对于热加载组件的子组件，无法保证在热加载后，它的私有状态与之前是一致的。

- Vue 根实例，或手动挂载的实例，无法进行热加载，而是要强制整个重新加载。

### 配置提示

- 你可以使用 `--port` 项来指定服务器使用别的端口

- 如果你的文件结构不一样，你需要在 Webpack 配置文件中配置 `output.publicPath`，相应地，在 webpack-dev-server 命令中设置 `--content-base`。

- 如果你使用 HTML5 history API（例如你用了 `vue-router`），那么也要增加 `--history-api-fallback`。

- 查看 [Webpack dev server 文档](https://webpack.github.io/docs/webpack-dev-server.html) 了解其他高级用法，例如结合其他后台服务器使用 webpack dev server。

- 最后，如果你有一个基于 Node.js 后台的 [Express](http://expressjs.com/en/index.html) 项目，你只需增加 [Webpack dev 中间件](https://webpack.github.io/docs/webpack-dev-middleware.html) 来返回 webpack 相关访问。