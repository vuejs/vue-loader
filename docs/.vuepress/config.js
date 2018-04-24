module.exports = {
  title: 'Vue Loader',
  description: 'Webpack loader for single-file Vue components',
  serviceWorker: true,
  theme: 'vue',
  themeConfig: {
    repo: 'vuejs/vue-loader',
    docsDir: 'docs',
    nav: [
      {
        text: 'Guide',
        link: '/guide/'
      },
      {
        text: 'SFC Spec',
        link: '/spec.html'
      },
      {
        text: 'Options Reference',
        link: '/options.html'
      },
      {
        text: 'Migrating from v14',
        link: '/migrating.md'
      }
    ],
    sidebar: [
      '/',
      '/guide/',
      '/guide/pre-processors',
      '/guide/asset-url',
      '/guide/scoped-css',
      '/guide/css-modules',
      '/guide/postcss',
      '/guide/hot-reload',
      '/guide/functional',
      '/guide/extract-css',
      '/guide/custom-blocks',
      '/guide/linting',
      '/guide/testing'
    ]
  }
}
