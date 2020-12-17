## [16.1.2](https://github.com/vuejs/vue-loader/compare/v16.1.1...v16.1.2) (2020-12-17)


### Bug Fixes

* resourceQuery could be undefined in webpack 5 ([6a1ee76](https://github.com/vuejs/vue-loader/commit/6a1ee76aa6a876155e2cd7fb1f133553a9c38706)), closes [#1771](https://github.com/vuejs/vue-loader/issues/1771)



## [16.1.1](https://github.com/vuejs/vue-loader/compare/v16.1.0...v16.1.1) (2020-12-04)


### Bug Fixes

* ensure consistent component id across blocks ([214b3f1](https://github.com/vuejs/vue-loader/commit/214b3f1b0ee60932c4c1f3542ce3e27ba46eb16e))



# [16.1.0](https://github.com/vuejs/vue-loader/compare/v16.0.0...v16.1.0) (2020-11-30)


### Features

* allow manually specifying whether server-rendering is targeted ([#1764](https://github.com/vuejs/vue-loader/issues/1764)) ([9bbb82b](https://github.com/vuejs/vue-loader/commit/9bbb82bc9026afabc2835e297c2b60aa834c9fda)), closes [#1734](https://github.com/vuejs/vue-loader/issues/1734)



# [16.0.0](https://github.com/vuejs/vue-loader/compare/v16.0.0-rc.2...v16.0.0) (2020-11-25)


### Bug Fixes

* update hmr api usage ([f9dd610](https://github.com/vuejs/vue-loader/commit/f9dd610abea88453dc90ceefd36920666a85629f))


### Features

* support for experimental sfc features ([b85244b](https://github.com/vuejs/vue-loader/commit/b85244b6e0b9a9428848b4cc3453326239866209)), closes [#1723](https://github.com/vuejs/vue-loader/issues/1723)
* support for new script setup and css var injection ([fd33cad](https://github.com/vuejs/vue-loader/commit/fd33cada00bbfa6119460f96092694caff31db74))


### Performance Improvements

* avoid resolveScript call in main loader ([e922648](https://github.com/vuejs/vue-loader/commit/e92264814bc86e498858463991c5b654058d14c5))



# [16.0.0-rc.2](https://github.com/vuejs/vue-loader/compare/v16.0.0-rc.1...v16.0.0-rc.2) (2020-11-18)


### Bug Fixes

* disable `esModuleInterop` & `allowSyntheticDefaultImports` for TS ([c76f5e5](https://github.com/vuejs/vue-loader/commit/c76f5e50ff1932986a0d1311708378612b4a8fe1))



# [16.0.0-rc.1](https://github.com/vuejs/vue-loader/compare/v16.0.0-rc.0...v16.0.0-rc.1) (2020-11-07)


### Bug Fixes

* add back generator support ([3db9ab8](https://github.com/vuejs/vue-loader/commit/3db9ab8e737bb518b6763dabc358c61ba858bcd4))



# [16.0.0-rc.0](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.10...v16.0.0-rc.0) (2020-11-06)


### Bug Fixes

* should apply cloned rules to custom blocks too ([b2d7ffb](https://github.com/vuejs/vue-loader/commit/b2d7ffb06d065fb40eade9335123eab2f491a17e))
* should check for `type` query for render function imports ([41af4b6](https://github.com/vuejs/vue-loader/commit/41af4b60ef5a0c3747ada20ebc1f10c5d427cd1d))



# [16.0.0-beta.10](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.9...v16.0.0-beta.10) (2020-11-03)


### Bug Fixes

* add rule plugins to keep up with webpack 5 new features ([be9077c](https://github.com/vuejs/vue-loader/commit/be9077cc3fd1a42b3378fd2ac354b57b51c9b885)), closes [/github.com/webpack/webpack/blob/v5.3.1/lib/NormalModuleFactory.js#L133-L152](https://github.com//github.com/webpack/webpack/blob/v5.3.1/lib/NormalModuleFactory.js/issues/L133-L152)
* avoid to generate empty css chunk files ([e88dbe9](https://github.com/vuejs/vue-loader/commit/e88dbe9cb699f29974eca3ddd70d1356288c4c55)), closes [#1464](https://github.com/vuejs/vue-loader/issues/1464)
* ensure new webpack5 generator property in rules passes ruleset checks ([#1754](https://github.com/vuejs/vue-loader/issues/1754)) ([fa79114](https://github.com/vuejs/vue-loader/commit/fa791147524147d0b4202c265042fc06bbe2265e))



# [16.0.0-beta.9](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.8...v16.0.0-beta.9) (2020-10-27)


### Bug Fixes

* avoid id inconsitency caused by CRLF ([4b9b26c](https://github.com/vuejs/vue-loader/commit/4b9b26c0433e1e7d404a337aa6991d571e554282)), closes [#1706](https://github.com/vuejs/vue-loader/issues/1706)
* fix mini-css-extract-plugin missing default export error ([#1749](https://github.com/vuejs/vue-loader/issues/1749)) ([55c6b12](https://github.com/vuejs/vue-loader/commit/55c6b12c1aae11c7941386fd09b369c92340d641))
* should not pass undefined to bindingsQuery ([#1735](https://github.com/vuejs/vue-loader/issues/1735)) ([859a45d](https://github.com/vuejs/vue-loader/commit/859a45dc202cdc899412ab770300fcb54f8bbc9d)), closes [#1740](https://github.com/vuejs/vue-loader/issues/1740)



# [16.0.0-beta.8](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.7...v16.0.0-beta.8) (2020-09-23)


### Bug Fixes

* fix ssrRender import ([83eb488](https://github.com/vuejs/vue-loader/commit/83eb48891610e5cf58a6a289b6af7aeccca4a7cb))


### Features

* output ssr render function when target is node ([e691f6b](https://github.com/vuejs/vue-loader/commit/e691f6bdb52de2a4ba6ad37c071256f6f7173fab))



# [16.0.0-beta.7](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.6...v16.0.0-beta.7) (2020-09-09)


### Bug Fixes

* do not throw when there's no script block in the SFC ([a2262ce](https://github.com/vuejs/vue-loader/commit/a2262ce4fa298ce9d9a3fbfc2d5fb75761caa0bb))
* temporary fix for [#1723](https://github.com/vuejs/vue-loader/issues/1723) ([9f6dd23](https://github.com/vuejs/vue-loader/commit/9f6dd236ed696259a415678664dfe7f8338f6635))



# [16.0.0-beta.6](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.5...v16.0.0-beta.6) (2020-09-09)


### Features

* support `<script setup>` ([fb09c8b](https://github.com/vuejs/vue-loader/commit/fb09c8b1755086c4e0627d0e83035e8ef53ed5c3))
* support `<style vars scoped>` ([1692287](https://github.com/vuejs/vue-loader/commit/1692287278f1903a3f8687ec5f57c567264471ac))



# [16.0.0-beta.5](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.4...v16.0.0-beta.5) (2020-08-11)


### Features

* allow `compiler` option to be a path to the compiler module ([#1711](https://github.com/vuejs/vue-loader/issues/1711)) ([064abd4](https://github.com/vuejs/vue-loader/commit/064abd4a16ed3d4f026df00e0ccfa03796be56ac))



# [16.0.0-beta.4](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.3...v16.0.0-beta.4) (2020-06-23)


### Bug Fixes

* skip matching rule with 'enforce' ([#1680](https://github.com/vuejs/vue-loader/issues/1680)) ([409a0e0](https://github.com/vuejs/vue-loader/commit/409a0e02832a2e33edc2ba99cbe11a8717545c93))



# [16.0.0-beta.3](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.2...v16.0.0-beta.3) (2020-05-25)


### Bug Fixes

* should export the `pitch` function ([79a94dd](https://github.com/vuejs/vue-loader/commit/79a94dda3f2c89755ac21c4555f53b13111452bf)), closes [#1677](https://github.com/vuejs/vue-loader/issues/1677)



# [16.0.0-beta.2](https://github.com/vuejs/vue-loader/compare/v16.0.0-beta.1...v16.0.0-beta.2) (2020-05-12)


### Bug Fixes

* do not require vue extension for template loader ([#1673](https://github.com/vuejs/vue-loader/issues/1673)) ([8c6eb5d](https://github.com/vuejs/vue-loader/commit/8c6eb5d9c3951c9f8edb5e8413915d754a05ad4b))



# [16.0.0-beta.1](https://github.com/vuejs/vue-loader/compare/v16.0.0-alpha.3...v16.0.0-beta.1) (2020-05-06)


### Bug Fixes

* fix css modules code gen ([a81c432](https://github.com/vuejs/vue-loader/commit/a81c432241a1740b6e9ca8990a5a99db39941612))


### Features

* support webpack 5 ([552bcb7](https://github.com/vuejs/vue-loader/commit/552bcb75a937e7b07838de079156b0205766c190))



# [16.0.0-alpha.3](https://github.com/vuejs/vue-loader/compare/v16.0.0-alpha.2...v16.0.0-alpha.3) (2020-02-04)


### Bug Fixes

* should not overwrite render when no <template> is present ([04903b6](https://github.com/vuejs/vue-loader/commit/04903b6edd222948b95dcddf613bc95f2d64992c))



# [16.0.0-alpha.2](https://github.com/vuejs/vue-loader/compare/v16.0.0-alpha.1...v16.0.0-alpha.2) (2020-01-10)


### Bug Fixes

* only inject hmrId when HMR is enabled ([162a21f](https://github.com/vuejs/vue-loader/commit/162a21fb4ba7c042c78fa31a01c5dd0298d6bdf2))



# [16.0.0-alpha.1](https://github.com/vuejs/vue-loader/compare/v16.0.0-alpha.0...v16.0.0-alpha.1) (2020-01-02)


### Features

* handle SFC parse error ([aa5530d](https://github.com/vuejs/vue-loader/commit/aa5530dd91a1d09a8099bfaf43bc0a0e3f364114))
* update to support named render function export ([625b9bb](https://github.com/vuejs/vue-loader/commit/625b9bb33d91124ae63e1ed280b44d27233bad23))



# [16.0.0-alpha.0](https://github.com/vuejs/vue-loader/compare/108c1c189fbe0f8f2c4c9360de5e7b3be1a60ebb...v16.0.0-alpha.0) (2019-12-20)


### Bug Fixes

* should use normalized resource for template code rule clone ([a9944ff](https://github.com/vuejs/vue-loader/commit/a9944ff3250c7cb6b5bea87fac3e68d7a46f12a1))
* support Rule.rules + fix rule for render fn ([d4072c4](https://github.com/vuejs/vue-loader/commit/d4072c4fa8c487f216f998cec7bb7b593dbcd93e))


### Features

* apply loaders matching .js to compiled template code ([20dbbfc](https://github.com/vuejs/vue-loader/commit/20dbbfca763206126d8be7c6d525bb50c0dfcb3a))
* basic hmr ([108c1c1](https://github.com/vuejs/vue-loader/commit/108c1c189fbe0f8f2c4c9360de5e7b3be1a60ebb))
* basic style support ([4dad151](https://github.com/vuejs/vue-loader/commit/4dad151742091445e029a5d74122ec74e6f88d50))
* css modules ([627c826](https://github.com/vuejs/vue-loader/commit/627c8262812f6ec54ab2f31b4d5a975eecb00b13))
* emit template compile error ([61c0f8c](https://github.com/vuejs/vue-loader/commit/61c0f8c721dd1bfde68deaa77c3078f91dc427db))
* handle line offset in errors ([201cc62](https://github.com/vuejs/vue-loader/commit/201cc62033de90eb69db907a8472078ef47cd314))
* more accurate template source map ([66d2ab8](https://github.com/vuejs/vue-loader/commit/66d2ab8e61f1086528a424893eff07e3457f7c03))
* properly map template position ([ee26c3a](https://github.com/vuejs/vue-loader/commit/ee26c3a10df6fb93556487362c49f57a52f0e2be))
* scopeId support ([d9f932e](https://github.com/vuejs/vue-loader/commit/d9f932ee14f34f9954481a95a323f2a1674c16ee))
* support custom blocks ([f238f59](https://github.com/vuejs/vue-loader/commit/f238f5913108c66e3a69800d9e1c771ee56d5c46))



