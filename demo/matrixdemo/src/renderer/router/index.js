import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'matrix-page',
      component: require('@/components/Matrix').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
