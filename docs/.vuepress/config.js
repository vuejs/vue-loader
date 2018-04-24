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
      '/guide/asset-url',
      '/guide/pre-processors',
      '/guide/scoped-css',
      '/guide/css-modules',
      '/guide/hot-reload',
      '/guide/functional',
      '/guide/custom-blocks',
      '/guide/extract-css',
      '/guide/linting',
      '/guide/testing'
    ]
  }
}
