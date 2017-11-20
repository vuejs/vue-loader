# Asset URL 핸들링

기본적으로, `vue-loader`는 [css-loader](https://github.com/webpack/css-loader)와 Vue 템플릿 컴파일러로 스타일과 템플릿을 자동으로 처리합니다. 이 컴파일 과정에서 `<img src="...">`, `background: url(...)`, CSS `@import`와 같은 모든 Asset URL은 **모듈 종속성** 으로 해결됩니다.

예를 들어, `url(./image.png)`는 `require('./image.png')`로 변환되어,

``` html
<img src="../image.png">
```

다음과 같이 컴파일 될 것입니다.

``` js
createElement('img', { attrs: { src: require('../image.png') }})
```

왜냐하면 `.png`는 Javscript 파일이 아니기 때문에 [file-loader](https://github.com/webpack/file-loader) 또는 [url-loader](https://github.com/webpack/url-loader)를 사용하여 webpack을 처리하도록 webpack을 구성해야 합니다. `vue-cli`로 스캐폴딩된 프로젝트도 이것을 구성했습니다.

이것을 사용하는 이점은 다음과 같습니다.

1. `file-loader`는 당신이 Asset 파일을 복사하여 붙여넣을 곳을 지정하고 더 나은 캐싱을 위해 버전 해시를 사용하여 이름을 지정하는 방법을 사용합니다. 더 나아가 **이것은 `*.vue` 파일 옆에 이미지를 놓고 배포 URL에 대해 걱정하지 않으면서 폴더 구조를 기반으로 상대 경로를 사용할 수 있습니다**. 올바른 설정을 사용하면 webpack은 파일 경로를 번들 아웃풋을 올바른 URL로 자동으로 재작성합니다.

2. `url-loader`는 파일이 주어진 값보다 작은 경우 조건부로 파일을 base-64 데이터 URL로 인라인 할 수 있도록 합니다. 이렇게하면 사소한 파일들에 대한 HTTP 요청의 양을 줄일 수 있습니다. 파일이 주어진 값보다 크면 자동으로 `file-loader`로 돌아갑니다.
