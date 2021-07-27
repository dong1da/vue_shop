import Vue from "vue";
import Router from "vue-router";

// 配置路由懒加载
const Login = () => import("views/Login");
const Home = () => import("views/home/Home");

// 安装插件
Vue.use(Router)

// 导出路由
const router =  new Router({
  routes: [
    {
      path: '',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home
    }

  ],
  // h5 history模式
  mode: 'history'
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to代表将要访问的路径
  // from代表从那个路径跳转而来
  // next是一个函数，表示方行  next() 放行   next('/login') 强制跳转
  if(to.path === '/login') return next();
  // 从sessStorage中获取token
  const tokenStr = window.sessionStorage.getItem('token'); 
  if(!tokenStr) return next('/login');
  next();
})

export default router