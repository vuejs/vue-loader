# 사용자 정의 블록

> 10.2.0 버전 이상에서 지원

`*.vue` 파일 안에 사용자 정의 language block을 정의할 수 있습니다. 사용자 정의 블록안의 내용은 `vue-loader` 옵션의 `loaders` 객체에 지정된 로더에서 처리된 다음 컴포넌트 모듈에서 요구됩니다. 설정은 [고급 로더 설정](../configurations/advanced.md)에서 설명한 내용과 유사합니다. 단, 일치하는 경우 `lang` 속성 대신 태그 이름을 사용합니다.

사용자 정의 블록에 일치하는 로더가 발견되면 처리합니다. 그렇지 않으면 무시합니다. 또한 발견된 로더가 함수를 반환하면 해당 함수는 `*.vue`파일의 컴포넌트를 매개변수로 사용하여 호출합니다.

## 단일 문서 파일 예제

다음은 모든 `<docs>` 사용자 정의 블록을 하나의 문서 파일로 추출하는 예 입니다.

#### component.vue

``` html
<docs>
## This is an Example component.
</docs>

<template>
  <h2 class="red">{{msg}}</h2>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}
</script>

<style>
comp-a h2 {
  color: #f00;
}
</style>
```

#### webpack.config.js

``` js
// Webpack 2.x
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          loaders: {
            // 모든 <docs>의 내용을 원문 그대로 추출합니다
            'docs': ExtractTextPlugin.extract('raw-loader'),
          }
        }
      }
    ]
  },
  plugins: [
    // 모든 docs를 하나의 파일로 추출합니다
    new ExtractTextPlugin('docs.md')
  ]
}
```

## 런타임에서 사용할 수 있는 문서

다음은 `<docs>` 사용자 정의 블록을 컴포넌트에 넣어 런타임에서 사용할 수 있는 예제입니다.

#### docs-loader.js

사용자 정의 블록 콘텐트를 삽입하려면 사용자 정의 로더가 필요합니다.

``` js
module.exports = function (source, map) {
  this.callback(null, 'module.exports = function(Component) {Component.options.__docs = ' +
    JSON.stringify(source) +
    '}', map)
}
```

#### webpack.config.js

webpack이 `<docs>` 사용자 정의 블록을 위한 로더를 사용하도록 설정합니다.

``` js
const docsLoader = require.resolve('./custom-loaders/docs-loader.js')

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue',
        options: {
          loaders: {
            'docs': docsLoader
          }
        }
      }
    ]
  }
}
```

#### component.vue

이제 `<docs>` 블록의 내용을 런타임 중에 컴포넌트에서 사용할 수 있습니다.

``` html
<template>
  <div>
    <component-b />
    <p>{{ docs }}</p>
  </div>
</template>

<script>
import componentB from 'componentB';

export default = {
  data () {
    return {
      docs: componentB.__docs
    }
  },
  components: {componentB}
}
</script>
```
