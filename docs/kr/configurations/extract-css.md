# CSS 단일 파일로 추출하기

다음 예제 설정을 사용하여 모든 Vue 컴포넌트의 처리된 CSS를 단일 CSS 파일로 추출할 수 있습니다.

### Webpack 1.x

``` bash
npm install extract-text-webpack-plugin --save-dev
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // 이 부분엔 다른 옵션도 들어 갈 수 있습니다.
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
    ]
  },
  vue: {
    loaders: {
      css: ExtractTextPlugin.extract("css"),
      // 당신은 <style lang="less"> 또는 다른 언어도 포함할 수 있습니다.
      less: ExtractTextPlugin.extract("css!less")
    }
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

### Webpack 2.x (^2.1.0-beta.25)

``` bash
npm install extract-text-webpack-plugin@2.x --save-dev
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // 이 부분엔 다른 옵션도 들어 갈 수 있습니다.
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'vue-style-loader' // <- 이것은 vue-loader의 의존성이므로, npm3를 사용하는 경우에는 명시적으로 설치할 필요가 없습니다.
            })
          }
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```
