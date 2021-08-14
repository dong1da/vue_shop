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
// 导入vue-quill-editor 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 配置请求的根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
Vue.prototype.$http = axios;

Vue.use(ElementUI)

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
