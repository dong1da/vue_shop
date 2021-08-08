import Vue from 'vue';
import App from './App.vue';
import router from './router';
// 全局导入element-ui的框架
import ElementUI from 'element-ui';
// 全局导入element-ui的样式
import 'element-ui/lib/theme-chalk/index.css';
// 导入全局样式表
import 'assets/css/global.css';
// 导入字体图标
import './assets/fonts/iconfont.css';
// 导入axios
import axios from 'axios'
// 导入TreeTable树形表格组件
import TreeTable from 'vue-table-with-tree-grid'

// 配置请求的根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios;

Vue.use(ElementUI)

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
