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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.Settings = void 0;
const tray = __importStar(require("./tray"));
exports.Settings = {
    "Electron.autoLaunch": {
        read() {
            return __awaiter(this, void 0, void 0, function* () {
                return global.launcher.isEnabled();
            });
        },
        write(value) {
            return __awaiter(this, void 0, void 0, function* () {
                if (value) {
                    return global.launcher.enable();
                }
                else {
                    return global.launcher.disable();
                }
            });
        },
    },
    "Electron.warnBeforeExit": {
        read() {
            return __awaiter(this, void 0, void 0, function* () {
                return global.store.get("warnBeforeExit", true);
            });
        },
        write(value) {
            return __awaiter(this, void 0, void 0, function* () {
                global.store.set("warnBeforeExit", value);
            });
        },
    },
    "Electron.alwaysShowMenuBar": {
        read() {
            return __awaiter(this, void 0, void 0, function* () {
                return !global.mainWindow.autoHideMenuBar;
            });
        },
        write(value) {
            return __awaiter(this, void 0, void 0, function* () {
                global.store.set('autoHideMenuBar', !value);
                global.mainWindow.autoHideMenuBar = !value;
                global.mainWindow.setMenuBarVisibility(value);
            });
        },
    },
    "Electron.showTrayIcon": {
        read() {
            return __awaiter(this, void 0, void 0, function* () {
                return tray.hasTray();
            });
        },
        write(value) {
            return __awaiter(this, void 0, void 0, function* () {
                if (value) {
                    // Create trayIcon icon
                    tray.create(global.trayConfig);
                }
                else {
                    tray.destroy();
                }
                global.store.set('minimizeToTray', value);
            });
        },
    },
    "Electron.enableHardwareAcceleration": {
        read() {
            return __awaiter(this, void 0, void 0, function* () {
                return !global.store.get('disableHardwareAcceleration', false);
            });
        },
        write(value) {
            return __awaiter(this, void 0, void 0, function* () {
                global.store.set('disableHardwareAcceleration', !value);
            });
        },
    },
};
