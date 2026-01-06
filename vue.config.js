const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api/v1': {
        target: 'http://130.162.37.11:8000',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api/v1': '/api/v1'
        }
      }
    }
  }
})
