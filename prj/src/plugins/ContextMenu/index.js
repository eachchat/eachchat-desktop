import Vue from 'vue';
import vueContextMenu from './contextMenu.vue';
let ContextMenuVue = Vue.extend(vueContextMenu);
let instance = undefined;

let calcPosition = function(clientX, clientY) {
  if(!instance) return;
  console.log("the instance.$el.style is ", instance.$el.style);
  instance.$el.style.left = clientX.toString() + "px";
  instance.$el.style.top = clientY.toString() + "px";
};

let contextMenu = (menuInfos) => {
    if (!instance) {
        instance = new ContextMenuVue();
        instance.vm = instance.$mount();
        document.body.appendChild(instance.vm.$el);
    }
    console.log("menuInfos is ", menuInfos);
    instance.menuItemList = menuInfos.menuList;
    instance.distItem = menuInfos.distItem;
    calcPosition(menuInfos.position.clientX, menuInfos.position.clientY);
    instance.show = true;
};

contextMenu.close = () => {
};

contextMenu.install = (Vue) => {
  console.log('install--------contextMenu');
  Vue.prototype.$contextMenu = contextMenu;
};

export default contextMenu;
