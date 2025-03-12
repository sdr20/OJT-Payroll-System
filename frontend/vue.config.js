module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:7777',
        changeOrigin: true
      }
    }
  },

  configureWebpack: {
    resolve: {
      extensions: ['.js', '.mjs', '.json', '.vue'],
      fallback: {
        fs: false,
        path: false
      }
    },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        }
      ]
    }
  },

  transpileDependencies: ['jspdf-autotable'],

  chainWebpack: (config) => {
    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .include
      .add(/node_modules/)
      .end()
      .type('javascript/auto');
  }
};