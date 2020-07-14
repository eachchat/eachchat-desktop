import Vue from 'vue';
import Router from 'vue-router';
import organization from '../components/organization.vue';
import ChatContent from '../components/chat-content.vue';
import favourite from '../components/favourite.vue';
import fileList from '../components/file-list.vue';
import historyMsg from '../components/history-message.vue';
import favouriteDetail from '../components/favourite-detail.vue';
import setup from '../components/setup.vue';
Vue.use(Router);
import reportRelationContent from '../components/reportRelationContent.vue';
import SearchFilesListDlg from '../components/searchFileList.vue';
import SearchMessagesListDlg from '../components/searchMessageList.vue';
import TransmitMsgListDlg from '../components/transmitTogetherContent.vue'

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
        {
          path:'setup',
          name: "setupPage",
          component: setup,
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
      path:'/favouriteDetail',
      name: "favouriteDetail",
      component: favouriteDetail,
    },    
    {
      path:'/reportRelationContent',
      name: "reportRelationContent",
      component: reportRelationContent,
    },
    {
      path:'/searchFilesList',
      name: 'searchFilesList',
      component: SearchFilesListDlg,
    },
    {
      path:'/searchMessageList',
      name: 'searchMessageList',
      component: SearchMessagesListDlg,
    },
    {
      path:'/TransmitMsgList',
      name: 'TransmitMsgList',
      component: TransmitMsgListDlg,
    },
    {
      path: '/index',
      redirect: '/'
    }
  ]
})
