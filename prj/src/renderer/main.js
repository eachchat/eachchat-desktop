import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import toastMessage from '../plugins/ToastMessage'
import VueCropper from 'vue-cropper'
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import VueVirtualScroller from "vue-virtual-scroller";
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
  template: '<App/>'
}).$mount('#app')
