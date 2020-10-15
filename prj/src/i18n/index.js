import Vue from 'vue';
import VueI18n from 'vue-i18n';
import {getDefaultLanguage} from '../config.js';
Vue.use(VueI18n);
//引入各个语言配置文件
import zh from './config/zh.js';
import en from './config/en.js';

function getCurLanguage() {
    var configLocale = getDefaultLanguage();
    var stroageLocale = global.mxMatrixClientPeg.getStorageLocale();
    if(stroageLocale != undefined) {
        return stroageLocale; 
    }
    return configLocale;
}
//创建实例
const i18n = new VueI18n({
    //默认语言
    locale: getCurLanguage(),
    messages: {
        zh, //中文
        en, //英文
    }
});

export default i18n;