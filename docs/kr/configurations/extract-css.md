# CSS 단일 파일로 추출하기

``` bash
npm install extract-text-webpack-plugin --save-dev
```

## 쉬운 방법

> vue-loader@^12.0.0와 webpack@^2.0.0 필요

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // other options...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: true
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```

위 코드는 `*.vue` 파일 내부에서 `<style>`에 대한 추출을 자동으로 처리하며, 대부분의 프리프로세서와 함께 사용할 수 있습니다.

 `*.vue`만 추출합니다. JavaScript에서 가져온 CSS는 별도로 설정해야합니다.

## 수동 설정

설정을 사용하여 모든 Vue 컴포넌트에서 처리된 CSS를 단일 CSS 파일로 추출하는 예제 입니다.

### webpack 2.x


``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // 기타 옵션...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'vue-style-loader' // <- vue-loader의 의존성입니다. 그래서 npm3를 사용하면 명시적으로 설치할 필요는 없습니다.
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

### webpack 1.x

``` bash
npm install extract-text-webpack-plugin --save-dev
```

``` js
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  // 기타 옵션...
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
      // <style lang="less"> 또는 다른 언어를 포함할 수 있습니다.
      less: ExtractTextPlugin.extract("css!less")
    }
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}
```
