# Тестирование
# Testing

> [Шаблон webpack vue-cli](https://github.com/vuejs-templates/webpack) предлагает вам готовые решения для модульного и e2e-тестирования.

Тестируя `*.vue` файлы, мы не можем использовать обычные тестовые движки для CommonJS, поскольку они не знают, как обрабатывать `*.vue` файлы. Вместо этого мы снова воспользуемся webpack + vue-loader для сборки наших тестов. Мы рекомендуем использовать сочетание [Karma](https://karma-runner.github.io/0.13/index.html) и [karma-webpack](https://github.com/webpack/karma-webpack).

Karma – это тестовый движок, который запускает браузеры и прогоняет тесты за вас. Вы можете выбрать, в каких браузерах выполнять тесты и какой тестовый фреймворк использовать (например, Mocha или Jasmin). Вот пример конфигурации Karma для тестирования в [PhantomJS](http://phantomjs.org/) с помощью фреймворка [Jasmine](https://jasmine.github.io/edge/introduction.html):

``` bash
npm install\
  karma karma-webpack\
  karma-jasmine jasmine-core\
  karma-phantomjs-launcher phantomjs-prebuilt\
  --save-dev
```

``` js
// мы можем воспользоваться тем же файлом конфигурации,
// однако, не забудьте удалить оригинальную точку входа,
// поскольку во время тестирования нам она не нужна
var webpackConfig = require('./webpack.config.js')
delete webpackConfig.entry

// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    // это файл точки входа для всех наших тестов.
    files: ['test/index.js'],
    // передаем файл точки входа в webpack для сборки.
    preprocessors: {
      'test/index.js': ['webpack']
    },
    // используем конфигурацию webpack
    webpack: webpackConfig,
    // избегаем стены бесполезного текста
    webpackMiddleware: {
      noInfo: true
    },
    singleRun: true
  })
}
```

И для файла точки входа `test/index.js`:

``` js
// test/index.js
// подтягиваем все файлы тестов, используя специальную возможность webpack
// https://webpack.github.io/docs/context.html#require-context
var testsContext = require.context('.', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
```

Эта точка входа просто подтягивает все другие файлы, названия которых заканчиваются на `.spec.js` в ту же папку. Теперь мы наконец-то можем написать немного тестов:

``` js
// test/component-a.spec.js
var Vue = require('vue')
var ComponentA = require('../../src/components/a.vue')

describe('a.vue', function () {

  // проверяем свойства JavaScript-объекта
  it('should have correct message', function () {
    expect(ComponentA.data().msg).toBe('Привет от компонента A!')
  })

  // проверяем результаты рендеринга, вызывая рендер компонента
  it('should render correct message', function () {
    var vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        'test': ComponentA
      }
    }).$mount()
    expect(vm.$el.querySelector('h2.red').textContent).toBe('Привет от компонента A!')
  })
})
```

Чтобы запустить тесты, добавьте следующий NPM скрипт:

``` js
// package.json
...
"scripts": {
  ...
  "test": "karma start karma.conf.js"
}
...
```

Наконец, запускаем:

``` bash
npm test
```

Опять же, [шаблон webpack vue-cli](https://github.com/vuejs-templates/webpack) содержит готовый рабочий пример с тестами.
