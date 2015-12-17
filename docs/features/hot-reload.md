# Hot Reload

"Hot Reload" is not simply reloading the page when you edit a file. With hot reload enabled, when you edit a `*.vue` file, all instances of that component will be swapped in **without reloading the page**. It even preserves the current state of your app and these swapped components! This dramatically improves the development experience when you are tweaking the templates or styling of your components.

![hot-reload](http://blog.evanyou.me/images/vue-hot.gif)

### Enabling Hot Reload

The easiest setup for enabling hot reload is what we outlined in the [basic tutorial](../start/tutorial.md):

``` js
// package.json
...
"scripts": {
  "dev": "webpack-dev-server --inline --hot"
}
...
```

This is assuming that you are serving the same `index.html` from the root of your project. By default, Webpack dev server uses the current working directory as its content base and serves all static files in the directory.

Run `npm run dev` and the static app will be served at `http://localhost:8080`.

### Hot Reload Notes

- When a component is hot-reloaded, its current state is preserved. However, the component itself is destroyed and recreated, so all of its lifecycle hooks will be called accordingly. Make sure to properly teardown any side effects in your lifecycle hooks.

- Private state for child components of a hot-reloaded component is not guaranteed to be preserved across reloads.

- A root Vue instance or a manually mounted instance cannot be hot-reloaded. It will always force a full reload.

### Configuration Tips

- You can use the `--port` option to serve at a different port.

- If your file structure is different, you will have to configure `output.publicPath` in your Webpack config and the `--content-base` option of your webpack-dev-server command accordingly.

- If you are using the HTML5 history API (for example with `vue-router`), you will also want to add the `--history-api-fallback` option.

- Consult the [Webpack dev server documentation](https://webpack.github.io/docs/webpack-dev-server.html) for advanced topics such as combining the dev server with another backend server.

- Finally, if you have an existing [Express](http://expressjs.com/en/index.html) based Node.js backend, you can just add the [Webpack dev middleware](https://webpack.github.io/docs/webpack-dev-middleware.html) to serve your webpack bundle.
