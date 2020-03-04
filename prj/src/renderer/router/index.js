import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login-page',
      component: require('@/components/name-login').default
    },
    {
      path: '/main',
      name: 'main-page',
      components: require('@/components/main.vue')
    },
    {
      path: '/index',
      redirect: '/'
    }
  ]
})
