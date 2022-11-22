"use strict";
/*
Copyright 2021 New Vector Ltd

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
const electron_1 = require("electron");
const url_1 = __importDefault(require("url"));
const fs_1 = __importDefault(require("fs"));
const request_1 = __importDefault(require("request"));
const path_1 = __importDefault(require("path"));
const language_helper_1 = require("./language-helper");
const MAILTO_PREFIX = "mailto:";
const PERMITTED_URL_SCHEMES = [
    'http:',
    'https:',
    MAILTO_PREFIX,
];
function safeOpenURL(target) {
    // openExternal passes the target to open/start/xdg-open,
    // so put fairly stringent limits on what can be opened
    // (for instance, open /bin/sh does indeed open a terminal
    // with a shell, albeit with no arguments)
    const parsedUrl = url_1.default.parse(target);
    if (PERMITTED_URL_SCHEMES.includes(parsedUrl.protocol)) {
        // explicitly use the URL re-assembled by the url library,
        // so we know the url parser has understood all the parts
        // of the input string
        const newTarget = url_1.default.format(parsedUrl);
        electron_1.shell.openExternal(newTarget);
    }
}
function onWindowOrNavigate(ev, target) {
    // always prevent the default: if something goes wrong,
    // we don't want to end up opening it in the electron
    // app, as we could end up opening any sort of random
    // url in a window that has node scripting access.
    ev.preventDefault();
    safeOpenURL(target);
}
function writeNativeImage(filePath, img) {
    var _a;
    switch ((_a = filePath.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) {
        case "jpg":
        case "jpeg":
            return fs_1.default.promises.writeFile(filePath, img.toJPEG(100));
        case "bmp":
            return fs_1.default.promises.writeFile(filePath, img.toBitmap());
        case "png":
        default:
            return fs_1.default.promises.writeFile(filePath, img.toPNG());
    }
}
function onLinkContextMenu(ev, params, webContents) {
    let url = params.linkURL || params.srcURL;
    if (url.startsWith('vector://vector/webapp')) {
        // Avoid showing a context menu for app icons
        if (params.hasImageContents)
            return;
        // Rewrite URL so that it can be used outside of the app
        url = "https://app.element.io/" + url.substring(23);
    }
    const popupMenu = new electron_1.Menu();
    // No point trying to open blob: URLs in an external browser: it ain't gonna work.
    if (!url.startsWith('blob:')) {
        popupMenu.append(new electron_1.MenuItem({
            label: url,
            click() {
                safeOpenURL(url);
            },
        }));
    }
    if (params.hasImageContents) {
        popupMenu.append(new electron_1.MenuItem({
            label: (0, language_helper_1._t)('Copy image'),
            accelerator: 'c',
            click() {
                webContents.copyImageAt(params.x, params.y);
            },
        }));
    }
    // No point offering to copy a blob: URL either
    if (!url.startsWith('blob:')) {
        // Special-case e-mail URLs to strip the `mailto:` like modern browsers do
        if (url.startsWith(MAILTO_PREFIX)) {
            popupMenu.append(new electron_1.MenuItem({
                label: (0, language_helper_1._t)('Copy email address'),
                accelerator: 'a',
                click() {
                    electron_1.clipboard.writeText(url.substr(MAILTO_PREFIX.length));
                },
            }));
        }
        else {
            popupMenu.append(new electron_1.MenuItem({
                label: params.hasImageContents
                    ? (0, language_helper_1._t)('Copy image address')
                    : (0, language_helper_1._t)('Copy link address'),
                accelerator: 'a',
                click() {
                    electron_1.clipboard.writeText(url);
                },
            }));
        }
    }
    // XXX: We cannot easily save a blob from the main process as
    // only the renderer can resolve them so don't give the user an option to.
    if (params.hasImageContents && !url.startsWith('blob:')) {
        popupMenu.append(new electron_1.MenuItem({
            label: (0, language_helper_1._t)('Save image as...'),
            accelerator: 's',
            click() {
                return __awaiter(this, void 0, void 0, function* () {
                    const targetFileName = params.suggestedFilename || params.altText || "image.png";
                    const { filePath } = yield electron_1.dialog.showSaveDialog({
                        defaultPath: targetFileName,
                    });
                    if (!filePath)
                        return; // user cancelled dialog
                    try {
                        if (url.startsWith("data:")) {
                            yield writeNativeImage(filePath, electron_1.nativeImage.createFromDataURL(url));
                        }
                        else {
                            request_1.default.get(url).pipe(fs_1.default.createWriteStream(filePath));
                        }
                    }
                    catch (err) {
                        console.error(err);
                        electron_1.dialog.showMessageBox({
                            type: "error",
                            title: (0, language_helper_1._t)("Failed to save image"),
                            message: (0, language_helper_1._t)("The image failed to save"),
                        });
                    }
                });
            },
        }));
    }
    // popup() requires an options object even for no options
    popupMenu.popup({});
    ev.preventDefault();
}
function cutCopyPasteSelectContextMenus(params) {
    const options = [];
    if (params.misspelledWord) {
        params.dictionarySuggestions.forEach(word => {
            options.push({
                label: word,
                click: (menuItem, browserWindow) => {
                    browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.webContents.replaceMisspelling(word);
                },
            });
        });
        options.push({
            type: 'separator',
        }, {
            label: (0, language_helper_1._t)('Add to dictionary'),
            click: (menuItem, browserWindow) => {
                browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord);
            },
        }, {
            type: 'separator',
        });
    }
    options.push({
        role: 'cut',
        label: (0, language_helper_1._t)('Cut'),
        accelerator: 't',
        enabled: params.editFlags.canCut,
    }, {
        role: 'copy',
        label: (0, language_helper_1._t)('Copy'),
        accelerator: 'c',
        enabled: params.editFlags.canCopy,
    }, {
        role: 'paste',
        label: (0, language_helper_1._t)('Paste'),
        accelerator: 'p',
        enabled: params.editFlags.canPaste,
    }, {
        role: 'pasteAndMatchStyle',
        enabled: params.editFlags.canPaste,
    }, {
        role: 'selectAll',
        label: (0, language_helper_1._t)("Select All"),
        accelerator: 'a',
        enabled: params.editFlags.canSelectAll,
    });
    return options;
}
function onSelectedContextMenu(ev, params) {
    const items = cutCopyPasteSelectContextMenus(params);
    const popupMenu = electron_1.Menu.buildFromTemplate(items);
    // popup() requires an options object even for no options
    popupMenu.popup({});
    ev.preventDefault();
}
function onEditableContextMenu(ev, params) {
    const items = [
        { role: 'undo' },
        { role: 'redo', enabled: params.editFlags.canRedo },
        { type: 'separator' },
        ...cutCopyPasteSelectContextMenus(params),
    ];
    const popupMenu = electron_1.Menu.buildFromTemplate(items);
    // popup() requires an options object even for no options
    popupMenu.popup({});
    ev.preventDefault();
}
let userDownloadIndex = 0;
const userDownloadMap = new Map(); // Map from id to path
electron_1.ipcMain.on('userDownloadAction', function (ev, { id, open = false }) {
    const path = userDownloadMap.get(id);
    if (open && path) {
        electron_1.shell.openPath(path);
    }
    userDownloadMap.delete(id);
});
exports.default = (webContents) => {
    webContents.on('new-window', onWindowOrNavigate);
    webContents.on('will-navigate', (ev, target) => {
        if (target.startsWith("vector://"))
            return;
        return onWindowOrNavigate(ev, target);
    });
    webContents.on('context-menu', function (ev, params) {
        if (params.linkURL || params.srcURL) {
            onLinkContextMenu(ev, params, webContents);
        }
        else if (params.selectionText) {
            onSelectedContextMenu(ev, params);
        }
        else if (params.isEditable) {
            onEditableContextMenu(ev, params);
        }
    });
    webContents.session.on('will-download', (event, item) => {
        item.once('done', (event, state) => {
            if (state === 'completed') {
                const savePath = item.getSavePath();
                const id = userDownloadIndex++;
                userDownloadMap.set(id, savePath);
                webContents.send('userDownloadCompleted', {
                    id,
                    name: path_1.default.basename(savePath),
                });
            }
        });
    });
};
