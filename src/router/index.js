import Vue from "vue";
import Router from "vue-router";

// 配置路由懒加载
const Login = () => import("views/Login");
const Home = () => import("views/home/Home");
const Welcome = () => import('views/home/children/Welcome');
const Users = () => import('views/user/Users');
const Rights = () => import('views/power/Rights.vue');
const Roles = () => import('views/power/Roles.vue');
const Cate = () => import('views/goods/Cate.vue');
const Params =() => import('views/goods/Params.vue');
const List = () => import('views/goods/List.vue')
const Add = () => import('views/goods/Add.vue')
const Order =() => import('views/order/Order.vue')

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
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/categories',
          component: Cate
        },
        {
          path: '/params',
          component: Params
        },
        {
          path: '/goods',
          component: List
        },
        {
          path: '/goods/add',
          component: Add
        },
        {
          path:'/orders',
          component: Order
        }
      ]
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

// 解决重复点击导航时，控制台出现报错
const VueRouterPush = Router.prototype.push
Router.prototype.push = function push (to) {
  return VueRouterPush.call(this, to).catch(err => err)
}
export default router