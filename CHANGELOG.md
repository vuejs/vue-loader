<a name="15.3.0"></a>
# [15.3.0](https://github.com/vuejs/vue-loader/compare/v15.2.7...v15.3.0) (2018-08-07)


### Bug Fixes

* avoid absolute path in cache-loader inline options ([c6ab50a](https://github.com/vuejs/vue-loader/commit/c6ab50a)), closes [#1367](https://github.com/vuejs/vue-loader/issues/1367)


### Features

* set file basename to __file in production ([#1368](https://github.com/vuejs/vue-loader/issues/1368)) ([2f441b9](https://github.com/vuejs/vue-loader/commit/2f441b9))



<a name="15.2.7"></a>
## [15.2.7](https://github.com/vuejs/vue-loader/compare/v15.2.6...v15.2.7) (2018-08-07)



<a name="15.2.6"></a>
## [15.2.6](https://github.com/vuejs/vue-loader/compare/v15.2.5...v15.2.6) (2018-07-18)


### Bug Fixes

* ensure consistent component id on different OS ([0766fe7](https://github.com/vuejs/vue-loader/commit/0766fe7)), closes [vuejs/vue-cli#1728](https://github.com/vuejs/vue-cli/issues/1728)



<a name="15.2.5"></a>
## [15.2.5](https://github.com/vuejs/vue-loader/compare/v15.2.4...v15.2.5) (2018-07-17)


### Bug Fixes

* ensure same compiler is used for both parse and tempalte compilation ([1bfc08a](https://github.com/vuejs/vue-loader/commit/1bfc08a))
* should not remove eslint-loader on src import blocks (close [#1359](https://github.com/vuejs/vue-loader/issues/1359)) ([6f1d404](https://github.com/vuejs/vue-loader/commit/6f1d404))
* support usage with other loaders with enforce: post ([be2384c](https://github.com/vuejs/vue-loader/commit/be2384c)), closes [#1351](https://github.com/vuejs/vue-loader/issues/1351)


### Features

* inherit root request query in custom block loaders ([#1330](https://github.com/vuejs/vue-loader/issues/1330)) ([0f0b09b](https://github.com/vuejs/vue-loader/commit/0f0b09b))



<a name="15.2.4"></a>
## [15.2.4](https://github.com/vuejs/vue-loader/compare/v15.2.2...v15.2.4) (2018-06-01)


### Bug Fixes

* ensure plugin error is emitted only once ([0b006a3](https://github.com/vuejs/vue-loader/commit/0b006a3))
* fix unexpected error when options of cache-loader contains ! ([#1334](https://github.com/vuejs/vue-loader/issues/1334)) ([c4a2719](https://github.com/vuejs/vue-loader/commit/c4a2719))
* use constant plugin NS ([0fb5172](https://github.com/vuejs/vue-loader/commit/0fb5172)), closes [#1331](https://github.com/vuejs/vue-loader/issues/1331)


### Features

* inject issuerPath to resourceQuery for custom block src imports ([#1313](https://github.com/vuejs/vue-loader/issues/1313)) ([a004e30](https://github.com/vuejs/vue-loader/commit/a004e30))



<a name="15.2.3"></a>
## [15.2.3](https://github.com/vuejs/vue-loader/compare/v15.2.2...v15.2.3) (2018-06-01)


### Bug Fixes

* ensure plugin error is emitted only once ([0b006a3](https://github.com/vuejs/vue-loader/commit/0b006a3))
* use constant plugin NS ([0fb5172](https://github.com/vuejs/vue-loader/commit/0fb5172)), closes [#1331](https://github.com/vuejs/vue-loader/issues/1331)


### Features

* inject issuerPath to resourceQuery for custom block src imports ([#1313](https://github.com/vuejs/vue-loader/issues/1313)) ([a004e30](https://github.com/vuejs/vue-loader/commit/a004e30))



<a name="15.2.2"></a>
## [15.2.2](https://github.com/vuejs/vue-loader/compare/v15.2.0...v15.2.2) (2018-05-28)


### Bug Fixes

* check loader for cnpm(npminstall) ([#1321](https://github.com/vuejs/vue-loader/issues/1321)) ([37fbaeb](https://github.com/vuejs/vue-loader/commit/37fbaeb))
* ensure template cache uses unique identifier ([538198e](https://github.com/vuejs/vue-loader/commit/538198e))



<a name="15.2.1"></a>
## [15.2.1](https://github.com/vuejs/vue-loader/compare/v15.2.0...v15.2.1) (2018-05-25)


### Bug Fixes

* ensure template cache uses unique identifier ([bdb13be](https://github.com/vuejs/vue-loader/commit/bdb13be))



<a name="15.2.0"></a>
# [15.2.0](https://github.com/vuejs/vue-loader/compare/v15.1.0...v15.2.0) (2018-05-22)


### Features

* enable template compile caching ([28e0fd3](https://github.com/vuejs/vue-loader/commit/28e0fd3))



<a name="15.1.0"></a>
# [15.1.0](https://github.com/vuejs/vue-loader/compare/v15.0.12...v15.1.0) (2018-05-19)


### Performance Improvements

* avoid duplicate linting when used with eslint-loader ([3d07f81](https://github.com/vuejs/vue-loader/commit/3d07f81))



<a name="15.0.12"></a>
## [15.0.12](https://github.com/vuejs/vue-loader/compare/v15.0.11...v15.0.12) (2018-05-18)


### Bug Fixes

* ignore attrs that might interfere with query generation ([3a37269](https://github.com/vuejs/vue-loader/commit/3a37269)), closes [vuejs/vue-cli#1324](https://github.com/vuejs/vue-cli/issues/1324)



<a name="15.0.11"></a>
## [15.0.11](https://github.com/vuejs/vue-loader/compare/v15.0.9...v15.0.11) (2018-05-15)


### Bug Fixes

* improve HMR reliability ([4ccd96f](https://github.com/vuejs/vue-loader/commit/4ccd96f))



<a name="15.0.10"></a>
## [15.0.10](https://github.com/vuejs/vue-loader/compare/v15.0.9...v15.0.10) (2018-05-11)


### Bug Fixes

* improve HMR reliability ([52012cd](https://github.com/vuejs/vue-loader/commit/52012cd))



<a name="15.0.9"></a>
## [15.0.9](https://github.com/vuejs/vue-loader/compare/v15.0.8...v15.0.9) (2018-05-04)


### Bug Fixes

* shadowMode still has to be an option ([4529f83](https://github.com/vuejs/vue-loader/commit/4529f83))



<a name="15.0.8"></a>
## [15.0.8](https://github.com/vuejs/vue-loader/compare/v15.0.7...v15.0.8) (2018-05-04)


### Bug Fixes

* avoid mutating original rules array ([14bfc01](https://github.com/vuejs/vue-loader/commit/14bfc01)), closes [#1286](https://github.com/vuejs/vue-loader/issues/1286)



<a name="15.0.7"></a>
## [15.0.7](https://github.com/vuejs/vue-loader/compare/v15.0.6...v15.0.7) (2018-05-03)


### Bug Fixes

* stylePostLoader injection for windows flat node_modules ([a9a4412](https://github.com/vuejs/vue-loader/commit/a9a4412)), closes [#1284](https://github.com/vuejs/vue-loader/issues/1284)



<a name="15.0.6"></a>
## [15.0.6](https://github.com/vuejs/vue-loader/compare/v15.0.5...v15.0.6) (2018-05-02)


### Bug Fixes

* duplicate loaders when using src import with loader options ([37329e1](https://github.com/vuejs/vue-loader/commit/37329e1)), closes [#1278](https://github.com/vuejs/vue-loader/issues/1278)



<a name="15.0.5"></a>
## [15.0.5](https://github.com/vuejs/vue-loader/compare/v15.0.4...v15.0.5) (2018-04-30)


### Bug Fixes

* ignore VueLoaderPlugin check when using thread-loader ([#1268](https://github.com/vuejs/vue-loader/issues/1268)) ([476f466](https://github.com/vuejs/vue-loader/commit/476f466)), closes [#1267](https://github.com/vuejs/vue-loader/issues/1267)



<a name="15.0.4"></a>
## [15.0.4](https://github.com/vuejs/vue-loader/compare/v15.0.3...v15.0.4) (2018-04-27)


### Bug Fixes

* enable whitelist in exclude function ([5b0e392](https://github.com/vuejs/vue-loader/commit/5b0e392))



<a name="15.0.3"></a>
## [15.0.3](https://github.com/vuejs/vue-loader/compare/v15.0.2...v15.0.3) (2018-04-26)


### Bug Fixes

* handle rule.use being a string (ref: [#1256](https://github.com/vuejs/vue-loader/issues/1256)) ([fc2ba27](https://github.com/vuejs/vue-loader/commit/fc2ba27))



<a name="15.0.2"></a>
## [15.0.2](https://github.com/vuejs/vue-loader/compare/v15.0.1...v15.0.2) (2018-04-26)


### Bug Fixes

* remove resource field in cloned rules (fix [#1254](https://github.com/vuejs/vue-loader/issues/1254)) ([35ca03f](https://github.com/vuejs/vue-loader/commit/35ca03f))



<a name="15.0.1"></a>
## [15.0.1](https://github.com/vuejs/vue-loader/compare/v15.0.0...v15.0.1) (2018-04-25)


### Bug Fixes

* prioritize .vue rules in plugin (fix [#1246](https://github.com/vuejs/vue-loader/issues/1246)) ([bffacd5](https://github.com/vuejs/vue-loader/commit/bffacd5))
* warn missing plugin ([068bb81](https://github.com/vuejs/vue-loader/commit/068bb81))



<a name="15.0.0"></a>
# [15.0.0](https://github.com/vuejs/vue-loader/compare/v15.0.0-rc.2...v15.0.0) (2018-04-24)


### Bug Fixes

* compat with null-loader (close [#1239](https://github.com/vuejs/vue-loader/issues/1239)) ([5cd5f6f](https://github.com/vuejs/vue-loader/commit/5cd5f6f))


### Features

* support declaring rules using .vue.html (ref [#1238](https://github.com/vuejs/vue-loader/issues/1238)) ([a3af6b3](https://github.com/vuejs/vue-loader/commit/a3af6b3))



<a name="15.0.0-rc.2"></a>
# [15.0.0-rc.2](https://github.com/vuejs/vue-loader/compare/v15.0.0-rc.1...v15.0.0-rc.2) (2018-04-11)


### Bug Fixes

* avoid bailout of webpack module concatenation ([#1230](https://github.com/vuejs/vue-loader/issues/1230)) ([b983304](https://github.com/vuejs/vue-loader/commit/b983304))
* reuse ident of css related loaders to avoid duplicates ([#1233](https://github.com/vuejs/vue-loader/issues/1233)) ([b16311f](https://github.com/vuejs/vue-loader/commit/b16311f))



<a name="15.0.0-rc.1"></a>
# [15.0.0-rc.1](https://github.com/vuejs/vue-loader/compare/v15.0.0-beta.7...v15.0.0-rc.1) (2018-04-06)


### Features

* support being used on files not ending with .vue ([5a9ee91](https://github.com/vuejs/vue-loader/commit/5a9ee91))



<a name="15.0.0-beta.7"></a>
# [15.0.0-beta.7](https://github.com/vuejs/vue-loader/compare/v15.0.0-beta.6...v15.0.0-beta.7) (2018-03-25)


### Features

* handle `<template lang="xxx">` with loaders ([c954f32](https://github.com/vuejs/vue-loader/commit/c954f32))


### BREAKING CHANGES

* `<template lang="xxx">` are now handled
with webpack loaders as well.



<a name="15.0.0-beta.6"></a>
# [15.0.0-beta.6](https://github.com/vuejs/vue-loader/compare/v15.0.0-beta.5...v15.0.0-beta.6) (2018-03-24)


### Bug Fixes

* compat with html-webpack-plugin ([8626739](https://github.com/vuejs/vue-loader/commit/8626739)), closes [#1213](https://github.com/vuejs/vue-loader/issues/1213)
* only reuse ident for whitelisted loaders ([230abd4](https://github.com/vuejs/vue-loader/commit/230abd4)), closes [#1214](https://github.com/vuejs/vue-loader/issues/1214)



<a name="15.0.0-beta.5"></a>
# [15.0.0-beta.5](https://github.com/vuejs/vue-loader/compare/v15.0.0-beta.4...v15.0.0-beta.5) (2018-03-23)


### Bug Fixes

* pass correct args to RuleSet.normalizeRule (fix [#1210](https://github.com/vuejs/vue-loader/issues/1210)) ([1c54dc4](https://github.com/vuejs/vue-loader/commit/1c54dc4))



<a name="15.0.0-beta.4"></a>
# [15.0.0-beta.4](https://github.com/vuejs/vue-loader/compare/v15.0.0-beta.3...v15.0.0-beta.4) (2018-03-23)


### Bug Fixes

* avoid babel options validation error (fix [#1209](https://github.com/vuejs/vue-loader/issues/1209)) ([d3e3f5e](https://github.com/vuejs/vue-loader/commit/d3e3f5e))



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



