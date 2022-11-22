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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const keytar_1 = require("./keytar");
let seshatSupported = false;
let Seshat;
let SeshatRecovery;
let ReindexError;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seshatModule = require('matrix-seshat');
    Seshat = seshatModule.Seshat;
    SeshatRecovery = seshatModule.SeshatRecovery;
    ReindexError = seshatModule.ReindexError;
    seshatSupported = true;
}
catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
        console.log("Seshat isn't installed, event indexing is disabled.");
    }
    else {
        console.warn("Seshat unexpected error:", e);
    }
}
let eventIndex = null;
const seshatDefaultPassphrase = "DEFAULT_PASSPHRASE";
function getOrCreatePassphrase(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (keytar_1.keytar) {
            try {
                const storedPassphrase = yield keytar_1.keytar.getPassword("element.io", key);
                if (storedPassphrase !== null) {
                    return storedPassphrase;
                }
                else {
                    const newPassphrase = yield (0, utils_1.randomArray)(32);
                    yield keytar_1.keytar.setPassword("element.io", key, newPassphrase);
                    return newPassphrase;
                }
            }
            catch (e) {
                console.log("Error getting the event index passphrase out of the secret store", e);
            }
        }
        return seshatDefaultPassphrase;
    });
}
const deleteContents = (p) => __awaiter(void 0, void 0, void 0, function* () {
    for (const entry of yield fs_1.promises.readdir(p)) {
        const curPath = path_1.default.join(p, entry);
        yield fs_1.promises.unlink(curPath);
    }
});
electron_1.ipcMain.on('seshat', function (_ev, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!global.mainWindow)
            return;
        // We do this here to ensure we get the path after --profile has been resolved
        const eventStorePath = path_1.default.join(electron_1.app.getPath('userData'), 'EventStore');
        const sendError = (id, e) => {
            const error = {
                message: e.message,
            };
            global.mainWindow.webContents.send('seshatReply', {
                id: id,
                error: error,
            });
        };
        const args = payload.args || [];
        let ret;
        switch (payload.name) {
            case 'supportsEventIndexing':
                ret = seshatSupported;
                break;
            case 'initEventIndex':
                if (eventIndex === null) {
                    const userId = args[0];
                    const deviceId = args[1];
                    const passphraseKey = `seshat|${userId}|${deviceId}`;
                    const passphrase = yield getOrCreatePassphrase(passphraseKey);
                    try {
                        yield fs_1.promises.mkdir(eventStorePath, { recursive: true });
                        eventIndex = new Seshat(eventStorePath, { passphrase });
                    }
                    catch (e) {
                        if (e instanceof ReindexError) {
                            // If this is a reindex error, the index schema
                            // changed. Try to open the database in recovery mode,
                            // reindex the database and finally try to open the
                            // database again.
                            const recoveryIndex = new SeshatRecovery(eventStorePath, {
                                passphrase,
                            });
                            const userVersion = yield recoveryIndex.getUserVersion();
                            // If our user version is 0 we'll delete the db
                            // anyways so reindexing it is a waste of time.
                            if (userVersion === 0) {
                                yield recoveryIndex.shutdown();
                                try {
                                    yield deleteContents(eventStorePath);
                                }
                                catch (e) {
                                }
                            }
                            else {
                                yield recoveryIndex.reindex();
                            }
                            eventIndex = new Seshat(eventStorePath, { passphrase });
                        }
                        else {
                            sendError(payload.id, e);
                            return;
                        }
                    }
                }
                break;
            case 'closeEventIndex':
                if (eventIndex !== null) {
                    const index = eventIndex;
                    eventIndex = null;
                    try {
                        yield index.shutdown();
                    }
                    catch (e) {
                        sendError(payload.id, e);
                        return;
                    }
                }
                break;
            case 'deleteEventIndex': {
                try {
                    yield deleteContents(eventStorePath);
                }
                catch (e) {
                }
                break;
            }
            case 'isEventIndexEmpty':
                if (eventIndex === null)
                    ret = true;
                else
                    ret = yield eventIndex.isEmpty();
                break;
            case 'isRoomIndexed':
                if (eventIndex === null)
                    ret = false;
                else
                    ret = yield eventIndex.isRoomIndexed(args[0]);
                break;
            case 'addEventToIndex':
                try {
                    eventIndex === null || eventIndex === void 0 ? void 0 : eventIndex.addEvent(args[0], args[1]);
                }
                catch (e) {
                    sendError(payload.id, e);
                    return;
                }
                break;
            case 'deleteEvent':
                try {
                    ret = yield (eventIndex === null || eventIndex === void 0 ? void 0 : eventIndex.deleteEvent(args[0]));
                }
                catch (e) {
                    sendError(payload.id, e);
                    return;
                }
                break;
            case 'commitLiveEvents':
                try {
                    ret = yield (eventIndex === null || eventIndex === void 0 ? void 0 : eventIndex.commit());
                }
                catch (e) {
                    sendError(payload.id, e);
                    return;
                }
                break;
            case 'searchEventIndex':
                try {
                    ret = yield (eventIndex === null || eventIndex === void 0 ? void 0 : eventIndex.search(args[0]));
                }
                catch (e) {
                    sendError(payload.id, e);
                    return;
                }
                break;
            case 'addHistoricEvents':
                if (eventIndex === null)
                    ret = false;
                else {
                    try {
                        ret = yield eventIndex.addHistoricEvents(args[0], args[1], args[2]);
                    }
                    catch (e) {
                        sendError(payload.id, e);
                        return;
                    }
                }
                break;
            case 'getStats':
                if (eventIndex === null)
                    ret = 0;
                else {
                    try {
                        ret = yield eventIndex.getStats();
                    }
                    catch (e) {
                        sendError(payload.id, e);
                        return;
                    }
                }
                break;
            case 'removeCrawlerCheckpoint':
                if (eventIndex === null)
                    ret = false;
                else {
                    try {
                        ret = yield eventIndex.removeCrawlerCheckpoint(args[0]);
                    }
                    catch (e) {
                        sendError(payload.id, e);
                        return;
                    }
                }
                break;
            case 'addCrawlerCheckpoint':
                if (eventIndex === null)
                    ret = false;
                else {
                    try {
                        ret = yield eventIndex.addCrawlerCheckpoint(args[0]);
                    }
                    catch (e) {
                        sendError(payload.id, e);
                        return;
                    }
                }
                break;
            case 'loadFileEvents':
                if (eventIndex === null)
                    ret = [];
                else {
                    try {
                        ret = yield eventIndex.loadFileEvents(args[0]);
                    }
                    catch (e) {
                        sendError(payload.id, e);
                        return;
                    }
                }
                break;
            case 'loadCheckpoints':
                if (eventIndex === null)
                    ret = [];
                else {
                    try {
                        ret = yield eventIndex.loadCheckpoints();
                    }
                    catch (e) {
                        ret = [];
                    }
                }
                break;
            case 'setUserVersion':
                if (eventIndex === null)
                    break;
                else {
                    try {
                        yield eventIndex.setUserVersion(args[0]);
                    }
                    catch (e) {
                        sendError(payload.id, e);
                        return;
                    }
                }
                break;
            case 'getUserVersion':
                if (eventIndex === null)
                    ret = 0;
                else {
                    try {
                        ret = yield eventIndex.getUserVersion();
                    }
                    catch (e) {
                        sendError(payload.id, e);
                        return;
                    }
                }
                break;
            default:
                global.mainWindow.webContents.send('seshatReply', {
                    id: payload.id,
                    error: "Unknown IPC Call: " + payload.name,
                });
                return;
        }
        global.mainWindow.webContents.send('seshatReply', {
            id: payload.id,
            reply: ret,
        });
    });
});
