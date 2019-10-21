module.exports = {
  css: {
    modules: true
  },
  outputDir: 'extension/build',
  productionSourceMap: false,
  publicPath: '',
  configureWebpack: {
    devtool: false
  },
  pages: {
    popup: {
      entry: './src/popup.js',
      template: 'public/index.html',
      title: 'eq8',
      chunks: ['chunk-vendors', 'chunk-common', 'popup']
    },
    options: {
      entry: './src/options.js',
      template: 'public/index.html',
      title: 'eq8 Options',
      chunks: ['chunk-vendors', 'chunk-common', 'options']
    }
  }
};
