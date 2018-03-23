<a name="15.0.0-beta.3"></a>
# [15.0.0-beta.3](https://github.com/vuejs/vue-loader/compare/v15.0.0-beta.2...v15.0.0-beta.3) (2018-03-23)


### Bug Fixes

* handle vue rule with include (fix [#1201](https://github.com/vuejs/vue-loader/issues/1201)) ([2be5507](https://github.com/vuejs/vue-loader/commit/2be5507))
* make sure cloned rules reuse the exact same ident in options ([eab9460](https://github.com/vuejs/vue-loader/commit/eab9460)), closes [#1199](https://github.com/vuejs/vue-loader/issues/1199)
* remove rule.loaders from normalized rules ([#1207](https://github.com/vuejs/vue-loader/issues/1207)) ([e9cbbcd](https://github.com/vuejs/vue-loader/commit/e9cbbcd))
* support test-less oneOf rules ([7208885](https://github.com/vuejs/vue-loader/commit/7208885))
* use relative path for self path resolution ([343b9df](https://github.com/vuejs/vue-loader/commit/343b9df))


### Features

* **loader:** support options.productionMode ([#1208](https://github.com/vuejs/vue-loader/issues/1208)) ([69bc1c1](https://github.com/vuejs/vue-loader/commit/69bc1c1))



<a name="15.0.0-beta.2"></a>
# [15.0.0-beta.2](https://github.com/vuejs/vue-loader/compare/v15.0.0-beta.1...v15.0.0-beta.2) (2018-03-22)


### Bug Fixes

* loader check for windows ([ab067b0](https://github.com/vuejs/vue-loader/commit/ab067b0))
* properly stringify hot-reload-api path for Windows ([fb1306e](https://github.com/vuejs/vue-loader/commit/fb1306e))



<a name="15.0.0-beta.1"></a>
# [15.0.0-beta.1](https://github.com/vuejs/vue-loader/compare/f418bd9...v15.0.0-beta.1) (2018-03-21)


### Bug Fixes

* remove .vue from fake resourcePath to avoid double match ([7c5b6ac](https://github.com/vuejs/vue-loader/commit/7c5b6ac))


### Features

* basic hot reload ([f418bd9](https://github.com/vuejs/vue-loader/commit/f418bd9))
* css modules + hmr ([99754c0](https://github.com/vuejs/vue-loader/commit/99754c0))
* dynamic style injection ([234d48b](https://github.com/vuejs/vue-loader/commit/234d48b))
* expose all block attrs via query ([cda1ec3](https://github.com/vuejs/vue-loader/commit/cda1ec3))
* respect user compiler / compilerOptions ([58239f6](https://github.com/vuejs/vue-loader/commit/58239f6))
* support configuring loader for custom blocks via resourceQuery ([d04f9cf](https://github.com/vuejs/vue-loader/commit/d04f9cf))
* support rules with oneOf ([c3b379d](https://github.com/vuejs/vue-loader/commit/c3b379d))



