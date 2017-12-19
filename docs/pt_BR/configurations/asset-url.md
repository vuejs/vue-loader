# Manipulação de recurso de URL

Por padrão, `vue-loader` automaticamente processa seus arquivos de estilos com[css-loader](https://github.com/webpack/css-loader) e seus templates com o compilador de template Vue. Neste processo de compilação, todos os recursos de URLs como `<img src="...">`, `background: url(...)` e CSS `@import` são **resolvidos como dependência de módulo**.

Por exemplo, `url(./image.png)` irá ser traduzido em `require('./image.png')`, e

```html
<img src="../image.png">
```

será compilado em:

```js
createElement('img', { attrs: { src: require('../image.png') }})
```

Como `.png` não é um arquivo JavaScript, você precisará configurar o webpack para usar [file-loader](https://github.com/webpack/file-loader) ou [url-loader](https://github.com/webpack/url-loader) para lidar com eles. O projeto estruturado com `vue-cli` também configurou isso para você.

Os benefícios de tudo isso são:

1. `file-loader` permite a você designar onde copiar e colar os arquivos de recursos \(assets\), e como nomeá-lo usando hashes de versão para melhorar o cache. Mas, isso também significa que **você pode simplesmente colocar imagens ao lado de seus arquivos `.vue` e usar o caminho relativo com base na estrutura de pastas em vez de se preocupar com URLs de implantação**. Com a configuração apropriada, webpack irá automaticamente reescrever o caminho dos arquivos em URLs corretas na saída empacotada.

2. `url-loader` permite a você colocar condicionalmente em linha um arquivo de dados URL base64 se eles forem menor que um determinado limite. Se o arquivo for maior do que o limite ele automaticamente será jogado para `file-loader`.
