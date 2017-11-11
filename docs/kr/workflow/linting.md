# Linting

`*.vue` 파일은 JavaScript가 아니기 때문에 내부 코드를 어떻게 lint하는지 궁금했을 겁니다. 우리는 당신이 [ESLint](http://eslint.org/)를 사용하고 있다고 가정합니다. (그렇지 않다면 사용해야합니다!)

`*.vue` 파일 내에서 JavaScript를 추출하고 linting하는 것과 함께 [eslint-html-plugin](https://github.com/BenoitZugmeyer/eslint-plugin-html)이 필요합니다.

그리고 ESLint 설정에 플러그인을 포함해야 합니다.

``` json
"plugins": [
  "html"
]
```

그 다음 커맨드 라인에서 다음과 같이 입력합니다.

``` bash
eslint --ext js,vue MyComponent.vue
```

또 다른 옵션은 [eslint-loader](https://github.com/MoOx/eslint-loader)를 사용하여 개발 중에 `*.vue` 파일이 저장될 때 자동으로 lint할 수 있습니다.

``` bash
npm install eslint eslint-loader --save-dev
```

``` js
// webpack.config.js
module.exports = {
  // 여기에 다른 옵션이 올 수 있습니다.
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue!eslint'
      }
    ]
  }
}
```

webpack 로더 체인이 **가장 먼저** 적용됩니다. `vue` 전에 `eslint`를 적용하여 컴파일 전 소스코드를 lint하세요.

우리가 고려해야할 한 가지는 NPM 패키지에 포함 된 써드파티 `*.vue` 컴포넌트를 사용하는 것 입니다. 이 경우에 우리는 써드파티 컴포넌트를 처리하기 위해 `vue-loader`를 사용하려고 하지만 그것을 lint하고 싶지는 않습니다. 우리는 lint를 webpack의 [preLoaders](https://webpack.github.io/docs/loaders.html#loader-order)로 분리할 수 있습니다.

``` js
// webpack.config.js
module.exports = {
  // 여기에 다른 옵션이 올 수 있습니다.
  module: {
    // 오직 로컬 *.vue 파일만 lint합니다.
    preLoaders: [
      {
        test: /\.vue$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    // 하지만 모든 *.vue 파일에 대해 vue-loader를 사용하세요.
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  }
}
```

webpack 2.x에서는 다음과 같이 처리합니다.

``` js
// webpack.config.js
module.exports = {
  // 여기에 다른 옵션이 올 수 있습니다.
  module: {
    rules: [
      // 오직 로컬 *.vue 파일만 lint합니다.
      {
        enforce: 'pre',
        test: /\.vue$/,
        loader: 'eslint',
        exclude: /node_modules/
      },
      // 하지만 모든 *.vue 파일에 대해 vue-loader를 사용하세요.
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  }
}
```
