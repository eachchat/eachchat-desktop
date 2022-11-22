"use strict";
/*
Copyright 2016 OpenMarket Ltd

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMenuTemplate = void 0;
const electron_1 = require("electron");
const language_helper_1 = require("./language-helper");
const isMac = process.platform === 'darwin';
function buildMenuTemplate() {
    // Menu template from http://electron.atom.io/docs/api/menu/, edited
    const template = [
        {
            label: (0, language_helper_1._t)('Edit'),
            accelerator: 'e',
            submenu: [
                {
                    role: 'undo',
                    label: (0, language_helper_1._t)('Undo'),
                },
                {
                    role: 'redo',
                    label: (0, language_helper_1._t)('Redo'),
                },
                { type: 'separator' },
                {
                    role: 'cut',
                    label: (0, language_helper_1._t)('Cut'),
                },
                {
                    role: 'copy',
                    label: (0, language_helper_1._t)('Copy'),
                },
                {
                    role: 'paste',
                    label: (0, language_helper_1._t)('Paste'),
                },
                {
                    role: 'pasteAndMatchStyle',
                    label: (0, language_helper_1._t)('Paste and Match Style'),
                },
                {
                    role: 'delete',
                    label: (0, language_helper_1._t)('Delete'),
                },
                {
                    role: 'selectAll',
                    label: (0, language_helper_1._t)('Select All'),
                },
            ],
        },
        {
            label: (0, language_helper_1._t)('View'),
            accelerator: 'V',
            submenu: [
                { type: 'separator' },
                {
                    role: 'resetZoom',
                    accelerator: 'CmdOrCtrl+Num0',
                    visible: false,
                },
                {
                    role: 'zoomIn',
                    accelerator: 'CmdOrCtrl+NumAdd',
                    visible: false,
                },
                {
                    role: 'zoomOut',
                    accelerator: 'CmdOrCtrl+NumSub',
                    visible: false,
                },
                {
                    role: 'resetZoom',
                    label: (0, language_helper_1._t)('Actual Size'),
                },
                {
                    role: 'zoomIn',
                    label: (0, language_helper_1._t)('Zoom In'),
                },
                {
                    role: 'zoomOut',
                    label: (0, language_helper_1._t)('Zoom Out'),
                },
                { type: 'separator' },
                // in macOS the Preferences menu item goes in the first menu
                ...(!isMac ? [{
                        label: (0, language_helper_1._t)('Preferences'),
                        click() { global.mainWindow.webContents.send('preferences'); },
                    }] : []),
                {
                    role: 'togglefullscreen',
                    label: (0, language_helper_1._t)('Toggle Full Screen'),
                },
                {
                    role: 'toggleDevTools',
                    label: (0, language_helper_1._t)('Toggle Developer Tools'),
                },
            ],
        },
        {
            label: (0, language_helper_1._t)('Window'),
            accelerator: 'w',
            role: 'window',
            submenu: [
                {
                    role: 'minimize',
                    label: (0, language_helper_1._t)('Minimize'),
                },
                {
                    role: 'close',
                    label: (0, language_helper_1._t)('Close'),
                },
            ],
        },
        {
            label: (0, language_helper_1._t)('Help'),
            accelerator: 'h',
            role: 'help',
            submenu: [
                {
                    label: (0, language_helper_1._t)('Element Help'),
                    click() { electron_1.shell.openExternal('https://element.io/help'); },
                },
            ],
        },
    ];
    // macOS has specific menu conventions...
    if (isMac) {
        template.unshift({
            // first macOS menu is the name of the app
            role: 'appMenu',
            label: electron_1.app.name,
            submenu: [
                {
                    role: 'about',
                    label: (0, language_helper_1._t)('About') + ' ' + electron_1.app.name,
                },
                { type: 'separator' },
                {
                    label: (0, language_helper_1._t)('Preferences') + '…',
                    accelerator: 'Command+,',
                    click() { global.mainWindow.webContents.send('preferences'); },
                },
                { type: 'separator' },
                {
                    role: 'services',
                    label: (0, language_helper_1._t)('Services'),
                    submenu: [],
                },
                { type: 'separator' },
                {
                    role: 'hide',
                    label: (0, language_helper_1._t)('Hide'),
                },
                {
                    role: 'hideOthers',
                    label: (0, language_helper_1._t)('Hide Others'),
                },
                {
                    role: 'unhide',
                    label: (0, language_helper_1._t)('Unhide'),
                },
                { type: 'separator' },
                {
                    role: 'quit',
                    label: (0, language_helper_1._t)('Quit'),
                },
            ],
        });
        // Edit menu.
        // This has a 'speech' section on macOS
        template[1].submenu.push({ type: 'separator' }, {
            label: (0, language_helper_1._t)('Speech'),
            submenu: [
                {
                    role: 'startSpeaking',
                    label: (0, language_helper_1._t)('Start Speaking'),
                },
                {
                    role: 'stopSpeaking',
                    label: (0, language_helper_1._t)('Stop Speaking'),
                },
            ],
        });
        // Window menu.
        // This also has specific functionality on macOS
        template[3].submenu = [
            {
                label: (0, language_helper_1._t)('Close'),
                accelerator: 'CmdOrCtrl+W',
                role: 'close',
            },
            {
                label: (0, language_helper_1._t)('Minimize'),
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize',
            },
            {
                label: (0, language_helper_1._t)('Zoom'),
                role: 'zoom',
            },
            {
                type: 'separator',
            },
            {
                label: (0, language_helper_1._t)('Bring All to Front'),
                role: 'front',
            },
        ];
    }
    else {
        template.unshift({
            label: (0, language_helper_1._t)('File'),
            accelerator: 'f',
            submenu: [
                // For some reason, 'about' does not seem to work on windows.
                /*{
                    role: 'about',
                    label: _t('About'),
                },*/
                {
                    role: 'quit',
                    label: (0, language_helper_1._t)('Quit'),
                },
            ],
        });
    }
    return electron_1.Menu.buildFromTemplate(template);
}
exports.buildMenuTemplate = buildMenuTemplate;
