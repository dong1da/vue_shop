// 为路径取别名
module.exports = {
  configureWebpack: {
    resolve: {
      // extensions: [],
      alias: {
        'assets': '@/assets',
        'components': '@/components',
        'network': '@/network',
        'views': '@/views'
      }
    }
  }
}