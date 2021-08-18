import Vue from 'vue';
import Router from 'vue-router';
import organization from '../components/organization.vue';
import ChatContent from '../components/chat-content.vue';
import favourite from '../components/favourite.vue';
import thirdpartyBind from '../components/thirdpartyBind.vue';
import childwindow from "../components/childwindow.vue";
import VoipWindow from "../components/voipwindow.vue";

import setup from '../components/setup.vue';
Vue.use(Router);
import TransmitMsgListDlg from '../components/transmitTogetherContent.vue';
import ImgViewDlg from '../components/imgViewer.vue';
import TrayNotice from '../components/trayNotice.vue';

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
      path:'/thirdpartyBind',
      name: "thirdpartyBind",
      component: thirdpartyBind,
    },
    {
      path:'/childwindow',
      name: "childwindow",
      component: childwindow,
    },
    {
      path:'/TransmitMsgList',
      name: 'TransmitMsgList',
      component: TransmitMsgListDlg,
    },
    {
      path:'/ImgView',
      name: 'ImgView',
      component: ImgViewDlg,
    },
    {
      path: '/index',
      redirect: '/'
    },
    {
      path: '/trayNotice',
      name: 'trayNotice',
      component: TrayNotice,
    },
    {
      path: '/voipwindow',
      name: "voipwindow",
      component: VoipWindow,
    },
  ]
})
