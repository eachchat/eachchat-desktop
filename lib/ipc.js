"use strict";
/*
Copyright 2022 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const protocol_1 = require("./protocol");
const utils_1 = require("./utils");
const settings_1 = require("./settings");
const keytar_1 = require("./keytar");
electron_1.ipcMain.on('setBadgeCount', function (_ev, count) {
    var _a;
    if (process.platform !== 'win32') {
        // only set badgeCount on Mac/Linux, the docs say that only those platforms support it but turns out Electron
        // has some Windows support too, and in some Windows environments this leads to two badges rendering atop
        // each other. See https://github.com/vector-im/element-web/issues/16942
        electron_1.app.badgeCount = count;
    }
    if (count === 0) {
        (_a = global.mainWindow) === null || _a === void 0 ? void 0 : _a.flashFrame(false);
    }
});
let focusHandlerAttached = false;
electron_1.ipcMain.on('loudNotification', function () {
    if (process.platform === 'win32' && global.mainWindow && !global.mainWindow.isFocused() && !focusHandlerAttached) {
        global.mainWindow.flashFrame(true);
        global.mainWindow.once('focus', () => {
            global.mainWindow.flashFrame(false);
            focusHandlerAttached = false;
        });
        focusHandlerAttached = true;
    }
});
let powerSaveBlockerId = null;
electron_1.ipcMain.on('app_onAction', function (_ev, payload) {
    switch (payload.action) {
        case 'call_state': {
            if (powerSaveBlockerId !== null && electron_1.powerSaveBlocker.isStarted(powerSaveBlockerId)) {
                if (payload.state === 'ended') {
                    electron_1.powerSaveBlocker.stop(powerSaveBlockerId);
                    powerSaveBlockerId = null;
                }
            }
            else {
                if (powerSaveBlockerId === null && payload.state === 'connected') {
                    powerSaveBlockerId = electron_1.powerSaveBlocker.start('prevent-display-sleep');
                }
            }
            break;
        }
    }
});
electron_1.ipcMain.on('ipcCall', function (_ev, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!global.mainWindow)
            return;
        const args = payload.args || [];
        let ret;
        switch (payload.name) {
            case 'getUpdateFeedUrl':
                ret = electron_1.autoUpdater.getFeedURL();
                break;
            case 'getSettingValue': {
                const [settingName] = args;
                const setting = settings_1.Settings[settingName];
                ret = yield setting.read();
                break;
            }
            case 'setSettingValue': {
                const [settingName, value] = args;
                const setting = settings_1.Settings[settingName];
                yield setting.write(value);
                break;
            }
            case 'setLanguage':
                global.appLocalization.setAppLocale(args[0]);
                break;
            case 'getAppVersion':
                ret = electron_1.app.getVersion();
                break;
            case 'focusWindow':
                if (global.mainWindow.isMinimized()) {
                    global.mainWindow.restore();
                }
                else if (!global.mainWindow.isVisible()) {
                    global.mainWindow.show();
                }
                else {
                    global.mainWindow.focus();
                }
                break;
            case 'getConfig':
                ret = global.vectorConfig;
                break;
            case 'navigateBack':
                if (global.mainWindow.webContents.canGoBack()) {
                    global.mainWindow.webContents.goBack();
                }
                break;
            case 'navigateForward':
                if (global.mainWindow.webContents.canGoForward()) {
                    global.mainWindow.webContents.goForward();
                }
                break;
            case 'setSpellCheckEnabled':
                if (typeof args[0] !== 'boolean')
                    return;
                global.mainWindow.webContents.session.setSpellCheckerEnabled(args[0]);
                global.store.set("spellCheckerEnabled", args[0]);
                break;
            case 'getSpellCheckEnabled':
                ret = global.store.get("spellCheckerEnabled", true);
                break;
            case 'setSpellCheckLanguages':
                try {
                    global.mainWindow.webContents.session.setSpellCheckerLanguages(args[0]);
                }
                catch (er) {
                    console.log("There were problems setting the spellcheck languages", er);
                }
                break;
            case 'getSpellCheckLanguages':
                ret = global.mainWindow.webContents.session.getSpellCheckerLanguages();
                break;
            case 'getAvailableSpellCheckLanguages':
                ret = global.mainWindow.webContents.session.availableSpellCheckerLanguages;
                break;
            case 'startSSOFlow':
                (0, protocol_1.recordSSOSession)(args[0]);
                break;
            case 'getPickleKey':
                try {
                    ret = yield (keytar_1.keytar === null || keytar_1.keytar === void 0 ? void 0 : keytar_1.keytar.getPassword("element.io", `${args[0]}|${args[1]}`));
                    // migrate from riot.im (remove once we think there will no longer be
                    // logins from the time of riot.im)
                    if (ret === null) {
                        ret = yield (keytar_1.keytar === null || keytar_1.keytar === void 0 ? void 0 : keytar_1.keytar.getPassword("riot.im", `${args[0]}|${args[1]}`));
                    }
                }
                catch (e) {
                    // if an error is thrown (e.g. keytar can't connect to the keychain),
                    // then return null, which means the default pickle key will be used
                    ret = null;
                }
                break;
            case 'createPickleKey':
                try {
                    const pickleKey = yield (0, utils_1.randomArray)(32);
                    yield (keytar_1.keytar === null || keytar_1.keytar === void 0 ? void 0 : keytar_1.keytar.setPassword("element.io", `${args[0]}|${args[1]}`, pickleKey));
                    ret = pickleKey;
                }
                catch (e) {
                    ret = null;
                }
                break;
            case 'destroyPickleKey':
                try {
                    yield (keytar_1.keytar === null || keytar_1.keytar === void 0 ? void 0 : keytar_1.keytar.deletePassword("element.io", `${args[0]}|${args[1]}`));
                    // migrate from riot.im (remove once we think there will no longer be
                    // logins from the time of riot.im)
                    yield (keytar_1.keytar === null || keytar_1.keytar === void 0 ? void 0 : keytar_1.keytar.deletePassword("riot.im", `${args[0]}|${args[1]}`));
                }
                catch (e) { }
                break;
            case 'getDesktopCapturerSources':
                ret = (yield electron_1.desktopCapturer.getSources(args[0])).map((source) => ({
                    id: source.id,
                    name: source.name,
                    thumbnailURL: source.thumbnail.toDataURL(),
                }));
                break;
            default:
                global.mainWindow.webContents.send('ipcReply', {
                    id: payload.id,
                    error: "Unknown IPC Call: " + payload.name,
                });
                return;
        }
        global.mainWindow.webContents.send('ipcReply', {
            id: payload.id,
            reply: ret,
        });
    });
});
