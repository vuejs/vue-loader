# 배포용 빌드

배포 환경을 위해 번들을 제작할 때는 다음 두 가지 작업을 수행해야 합니다.

1. 어플리케이션 코드를 최소화 합니다.
2. Vue.js 소스 코드의 모든 경고를 제거하려면 [Vue.js 가이드에 설명된 설정](https://vuejs.org/guide/deployment.html)을 사용하세요.

여기 예제 설정이 있습니다.

``` js
// webpack.config.js
module.exports = {
  // 여기에 다른 옵션이 올 수 있습니다.
  plugins: [
    // 모든 Vue.js 경고 코드를 숨깁니다.
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // 불필요한 코드를 제거하여 최소화 합니다.
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    // 발생 횟수에 따라 모듈 ID를 최적화합니다.
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}
```

개발 중에는 이 설정을 사용하고 싶지 않으므로 이것을 해결하는 몇 가지 방법이 있습니다.

1. 환경변수 기반으로 설정 오브젝트를 동적으로 빌드할 수 있습니다.

2. 또는 개발용 webpack 설정 파일과 배포용 설정 파일을 분리하여 사용합니다. 그리고 [vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0)에 표시 된 것처럼 세 번째 파일에서 공통 옵션을 공유할 수도 있습니다.

당신에게 목표 달성이 달려있습니다.
