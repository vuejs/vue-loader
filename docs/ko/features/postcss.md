# PostCSS

`vue-loader`에 의해서 처리된 모든 CSS 아웃풋은 범위가 지정된 CSS의 재작성을 위해 [PostCSS](https://github.com/postcss/postcss)를 통해 파이프됩니다. 당신은 프로세스에 [autoprefixer](https://github.com/postcss/autoprefixer) 또는 [CSSNext](http://cssnext.io/)와 같은 사용자 정의 PostCSS 플러그인을 추가할 수 있습니다.

Webpack 1.x의 예제입니다.

``` js
// webpack.config.js
module.exports = {
  // other configs...
  vue: {
    // use custom postcss plugins
    postcss: [require('postcss-cssnext')()]
  }
}
```

Webpack 2.x의 예제입니다.

``` js
// webpack.config.js
module.exports = {
  // other options...
  module: {
    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        // vue-loader options goes here
        options: {
          // ...
          postcss: [require('postcss-cssnext')()]
          }
        }
      }
    ]
  }
}
```

In addition to providing an Array of plugins, the `postcss` option also accepts:
`postcss` 옵션은 플러그인의 배열을 제공하는 것 외에도 다음 옵션을 사용할 수 있습니다.

- 플러그인 배열을 반환하는 함수.

- PostCSS 프로세서에 전달할 옵션을 포함하는 객체. 이것은 사용자 정의 parser/stringifiers에 의존하는 PostCSS 프로젝트를 사용할 때 유용합니다.

  ``` js
  postcss: {
    plugins: [...], // list of plugins
    options: {
      parser: sugarss // use sugarss parser
    }
  }
  ```
