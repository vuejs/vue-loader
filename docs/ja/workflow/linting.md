# リント

あなたは JavaScript でない `*.vue` の中のコードをどうやってリント (lint) するのか疑問に思っているかも知れません。[ESLint](https://eslint.org/) を使用していると仮定します(もし使っていないのならばすべきです!)

Vue ファイル内の template と script の部分両方のリントをサポートする公式 [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue) も同様に必要です。

あなたの ESLint の設定にプラグインの設定を含めて使用してください:

``` json
{
  "extends": [
    "plugin:vue/essential"
  ]
}
```

コマンドラインで次を実行してください:

``` bash
eslint --ext js,vue MyComponent.vue
```

別のオプションは `*.vue` ファイルが開発中に保存時されたとき、自動的にリントされるように [eslint-loader](https://github.com/MoOx/eslint-loader) を使用しています:

``` bash
npm install eslint eslint-loader --save-dev
```

プリローダーとして適用されていることを確認してください:

``` js
// webpack.config.js
module.exports = {
  // 他のオプション
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  }
}
```
