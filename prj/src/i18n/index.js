import Vue from 'vue';
import VueI18n from 'vue-i18n';
import {getDefaultLanguage} from '../config.js';
Vue.use(VueI18n);
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
const i18n = new VueI18n({
    locale: getCurLanguage(),
    messages: {
        zh, 
        en, 
    }
});

export default i18n;