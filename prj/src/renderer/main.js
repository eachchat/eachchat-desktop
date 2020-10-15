import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import {MatrixClientPeg} from '../packages/data/MatrixClientPeg.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import toastMessage from '../plugins/ToastMessage'
import VueCropper from 'vue-cropper'
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import VueVirtualScroller from "vue-virtual-scroller";
import i18n from '../i18n/';
Vue.use(VueCropper)
Vue.use(toastMessage)
Vue.use(ElementUI)
Vue.use(VueVirtualScroller)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>'
}).$mount('#app')
