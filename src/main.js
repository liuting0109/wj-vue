// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import store from './store'

// 设置反向代理，前端请求默认发送到 http://localhost:8443/api
var axios = require('axios')
axios.defaults.baseURL = 'http://localhost:8443/api'
// 让前端能够带上 cookie
axios.defaults.withCredentials = true
// 全局注册，之后可在其他组件中通过 this.$axios 发送数据
Vue.prototype.$axios = axios
Vue.config.productionTip = false

Vue.use(ElementUI)
// 使用钩子函数判断是否拦截,在访问每一个路由前调用
router.beforeEach((to, from, next) => {
  // 如果前端没有登录信息则直接拦截，如果有则判断后端是否正常登录（防止构造参数绕过）
  if (store.state.user.username && to.path.startsWith('/admin')) {
    axios.get('/authentication').then(resp => {
      console.log('菜单加载成功')
      initAdminMenu(router, store)
    })
  }
  // 首先判断访问的路径是否需要被拦截进行登录
  if (to.meta.requireAuth) {
    // 判断 store 里有没有存储 user 的信息，如果存在，则放行
    if (store.state.user.username) {
      axios.get('/authentication').then(resp => {
        console.log('resp:', resp)
        if (resp.data) {
          next()
        } else {
          // 否则跳转到登录页面
          // 并存储访问的页面路径（以便在登录后跳转到访问页）
          next({
            path: 'login',
            query: {
              redirect: to.fullPath}
          })
        }
      })
    } else {
      // 否则跳转到登录页面
      // 并存储访问的页面路径（以便在登录后跳转到访问页）
      next({
        path: 'login',
        query: {redirect: to.fullPath}
      })
    }
  } else {
    next()
  }
})

export const initAdminMenu = (router, store) => {
  // 防止重复触发加载菜单操作
  if (store.state.adminMenus.length > 0) {
    return
  }
  axios.get('/menu').then(resp => {
    if (resp && resp.status === 200) {
      var fmtRoutes = formatRoutes(resp.data.result)
      // resp.data为object
      console.log('resp.data', resp.data)
      // resp.data.result为数组
      console.log('resp.data.result', resp.data.result)
      router.addRoutes(fmtRoutes)
      store.commit('initAdminMenu', fmtRoutes)
    }
  })
}

const formatRoutes = (routes) => {
  // console.log('router-lt:', routes)
  let fmtRoutes = []
  routes.forEach(route => {
    // console.log('router-lt1:', router)
    if (route.children) {
      route.children = formatRoutes(route.children)
    }

    let fmtRoute = {
      path: route.path,
      component: resolve => {
        require(['./components/admin/' + route.component + '.vue'], resolve)
      },
      name: route.name,
      nameZh: route.nameZh,
      iconCls: route.iconCls,
      children: route.children
    }
    fmtRoutes.push(fmtRoute)
  })
  return fmtRoutes
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store,
  components: { App },
  template: '<App/>'
})
