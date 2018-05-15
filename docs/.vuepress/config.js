module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue Loader',
      description: 'Webpack loader for single-file Vue components'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Vue Loader',
      description: '处理 Vue 单文件组件的 Webpack loader'
    }
  },
  serviceWorker: true,
  theme: 'vue',
  themeConfig: {
    repo: 'vuejs/vue-loader',
    docsDir: 'docs',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
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
      },
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        editLinkText: '在 GitHub 上编辑此页',
        nav: [
          {
            text: '指南',
            link: '/zh/guide/'
          },
          {
            text: '单文件组件规范',
            link: '/zh/spec.html'
          },
          {
            text: '选项参考',
            link: '/zh/options.html'
          },
          {
            text: '如何从 v14 迁移',
            link: '/zh/migrating.md'
          }
        ],
        sidebar: [
          '/zh/',
          '/zh/guide/',
          '/zh/guide/asset-url',
          '/zh/guide/pre-processors',
          '/zh/guide/scoped-css',
          '/zh/guide/css-modules',
          '/zh/guide/hot-reload',
          '/zh/guide/functional',
          '/zh/guide/custom-blocks',
          '/zh/guide/extract-css',
          '/zh/guide/linting',
          '/zh/guide/testing'
        ]
      }
    }
  }
}
