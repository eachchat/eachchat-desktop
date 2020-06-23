import Vue from 'vue'
import Router from 'vue-router'
import organization from '../components/organization.vue'
import ChatContent from '../components/chat-content.vue'
import favourite from '../components/favourite.vue'
import fileList from '../components/file-list.vue'
import historyMsg from '../components/history-message.vue';

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
      component: require('@/components/main.vue').default,
      children: [
        {
          path: "ChatContent",
          name: "ChatContent",
          component: ChatContent
        },
        {
          path: "organization",
          name: "organization",
          component: organization
        },
        {
          path: "favourite",
          name: "favourite",
          component: favourite
        },
      ]
    },
    {
      path: '/fileList',
      name: "fileListDlg",
      component: fileList
    },
    {
      path: '/historyMsgList',
      name: "historyMsgDlg",
      component: historyMsg
    },
    {
      path: '/index',
      redirect: '/'
    }
  ]
})
