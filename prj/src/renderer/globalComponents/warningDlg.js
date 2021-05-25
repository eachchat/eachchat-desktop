import Vue from 'vue'; 
import Alert from './warningDlg.vue';
let AlertConstructor = Vue.extend(Alert); //

let AlertModal = (o) => {
  let alertDom = new AlertConstructor({
    el: document.createElement('div')
  })
  document.body.appendChild(alertDom.$el); 
  console.log('DDDDDD')
  
  alertDom.title = o.title || '信息';
  // 
  alertDom.content = o.content;
  // 
  alertDom.cancelBtn = o.cancelBtn;

  //
  alertDom.a_close = o.close || null;
  alertDom.a_confirm = o.confirm || null;
  alertDom.a_cancel = o.cancel || null;

}
export default AlertModal;