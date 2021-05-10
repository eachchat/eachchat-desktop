import Vue from 'vue'
import vueToastMessage from './index.vue'
let ToastTem = Vue.extend(vueToastMessage)
let instance
let timer = null
let toastMessage = (options) => {
  if (!instance) {
    instance = new ToastTem()
    instance.vm = instance.$mount()
    document.body.appendChild(instance.vm.$el)
  }
  console.log(options)
  if (timer) {
    clearTimeout(timer)
    timer = null
    instance.show = false
    instance.message = ''
    instance.type = ''
    instance.showWidth = ''
    instance.showHeight = ''
  }
  instance.time = 3000
  if (typeof options === 'string') {
    instance.message = options
  } else if (typeof options === 'object') {
    let {message, time, type, showWidth, showHeight} = options
    console.log("get showheight is", showHeight);
    instance.message = message
    instance.time = time || 3000
    instance.type = type
    instance.showWidth = showWidth != undefined ? showWidth : ''
    instance.showHeight = showHeight != undefined ? showHeight : ''
  } else {
    return
  }
  instance.show = true
  timer = setTimeout(() => {
    instance.show = false
    clearTimeout(timer)
    timer = null
    instance.message = ''
    instance.type = ''
    instance.showWidth = ''
    instance.showHeight = ''
  }, instance.time)
}
toastMessage.close = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
    instance.show = false
    instance.message = ''
    instance.type = ''
    instance.showWidth = ''
    instance.showHeight = ''
  }
}
toastMessage.install = (Vue) => {
  console.log('install--------toastMessage')
  Vue.prototype.$toastMessage = toastMessage
}
export default toastMessage
