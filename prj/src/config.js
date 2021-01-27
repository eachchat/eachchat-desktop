import * as path from 'path';
import * as fs from 'fs-extra';
import log from 'electron-log'
/**
 * {
 *      "homeserver": {
 *          "url": "https://matrix.each.chat",
 *          "server_name": ""
 *      },
 *      "defaultLanguage": "zh",
 * }
 */

function _loadConfigSync() {
    var configPath = path.join(__dirname, "config.json");
    if(fs.existsSync(configPath)) {
        try{
            var conf = fs.readJsonSync(configPath);
            return conf;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    return {};
}

function getConf(key) {
    var conf = _loadConfigSync();
    if(conf[key] == undefined) {
        return undefined;
    }
    return conf[key];
}

function getDefaultHomeServerAddr() {
    var homeserverInfo = getConf("homeserver");
    if(homeserverInfo == undefined) {
        return "https://matrix.each.chat";
    }
    return homeserverInfo.url;
}

function getDefaultHomeServerName() {
    var homeserverInfo = getConf("homeserver");
    if(homeserverInfo == undefined) {
        return "";
    }
    return homeserverInfo.server_name;
}

function getDefaultHomeServerInfo() {
    var homeserverInfo = getConf("homeserver");
    if(homeserverInfo == undefined) {
        return undefined;
    }
    return homeserverInfo;
}

function getDefaultLanguage() {
    var defaultLanguage = getConf("defaultLanguage");
    console.log("------- ", defaultLanguage);
    log.info("getDefaultHomeServerName", defaultLanguage);
    if(defaultLanguage == undefined) {
        return "zh";
    }
    return defaultLanguage;
}
export {getDefaultHomeServerAddr, getDefaultLanguage};