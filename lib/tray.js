"use strict";
/*
Copyright 2017 Karl Glatz <karl@glatz.biz>
Copyright 2017 OpenMarket Ltd

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApplicationMenu = exports.create = exports.destroy = exports.hasTray = void 0;
const electron_1 = require("electron");
const png_to_ico_1 = __importDefault(require("png-to-ico"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const language_helper_1 = require("./language-helper");
let trayIcon = null;
function hasTray() {
    return (trayIcon !== null);
}
exports.hasTray = hasTray;
function destroy() {
    if (trayIcon) {
        trayIcon.destroy();
        trayIcon = null;
    }
}
exports.destroy = destroy;
function toggleWin() {
    if (global.mainWindow.isVisible() && !global.mainWindow.isMinimized() && global.mainWindow.isFocused()) {
        global.mainWindow.hide();
    }
    else {
        if (global.mainWindow.isMinimized())
            global.mainWindow.restore();
        if (!global.mainWindow.isVisible())
            global.mainWindow.show();
        global.mainWindow.focus();
    }
}
function create(config) {
    // no trays on darwin
    if (process.platform === 'darwin' || trayIcon)
        return;
    const defaultIcon = electron_1.nativeImage.createFromPath(config.icon_path);
    trayIcon = new electron_1.Tray(defaultIcon);
    trayIcon.setToolTip(config.brand);
    initApplicationMenu();
    trayIcon.on('click', toggleWin);
    let lastFavicon = null;
    global.mainWindow.webContents.on('page-favicon-updated', function (ev, favicons) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!favicons || favicons.length <= 0 || !favicons[0].startsWith('data:')) {
                if (lastFavicon !== null) {
                    global.mainWindow.setIcon(defaultIcon);
                    trayIcon === null || trayIcon === void 0 ? void 0 : trayIcon.setImage(defaultIcon);
                    lastFavicon = null;
                }
                return;
            }
            // No need to change, shortcut
            if (favicons[0] === lastFavicon)
                return;
            lastFavicon = favicons[0];
            let newFavicon = electron_1.nativeImage.createFromDataURL(favicons[0]);
            // Windows likes ico's too much.
            if (process.platform === 'win32') {
                try {
                    const icoPath = path_1.default.join(electron_1.app.getPath('temp'), 'win32_element_icon.ico');
                    fs_1.default.writeFileSync(icoPath, yield (0, png_to_ico_1.default)(newFavicon.toPNG()));
                    newFavicon = electron_1.nativeImage.createFromPath(icoPath);
                }
                catch (e) {
                    console.error("Failed to make win32 ico", e);
                }
            }
            trayIcon === null || trayIcon === void 0 ? void 0 : trayIcon.setImage(newFavicon);
            global.mainWindow.setIcon(newFavicon);
        });
    });
    global.mainWindow.webContents.on('page-title-updated', function (ev, title) {
        trayIcon === null || trayIcon === void 0 ? void 0 : trayIcon.setToolTip(title);
    });
}
exports.create = create;
function initApplicationMenu() {
    if (!trayIcon) {
        return;
    }
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: (0, language_helper_1._t)('Show/Hide'),
            click: toggleWin,
        },
        { type: 'separator' },
        {
            label: (0, language_helper_1._t)('Quit'),
            click: function () {
                electron_1.app.quit();
            },
        },
    ]);
    trayIcon.setContextMenu(contextMenu);
}
exports.initApplicationMenu = initApplicationMenu;
