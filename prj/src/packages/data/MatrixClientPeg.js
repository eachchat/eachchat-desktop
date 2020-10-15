import olmWasmPath from "olm/olm.wasm"
import Olm from 'olm';
import * as matrixcs from 'matrix-js-sdk'
import {getDefaultLanguage} from '../../config.js';

class _MatrixClientPeg{
    constructor(){
        this.matrixClient = undefined;
        this.homeserve = "";
        this.registrationClient = undefined;
        this.curLanguage = getDefaultLanguage();
    }

    InitOlm(){
        /* Load Olm. We try the WebAssembly version first, and then the legacy,
            * asm.js version if that fails. For this reason we need to wait for this
            * to finish before continuing to load the rest of the app. In future
            * we could somehow pass a promise down to react-sdk and have it wait on
            * that so olm can be loading in parallel with the rest of the app.
            *
            * We also need to tell the Olm js to look for its wasm file at the same
            * level as index.html. It really should be in the same place as the js,
            * ie. in the bundle directory, but as far as I can tell this is
            * completely impossible with webpack. We do, however, use a hashed
            * filename to avoid caching issues.
            */
        return Olm.init({
            locateFile: () => olmWasmPath,
        }).then(() => {
            console.log("Using WebAssembly Olm");
        }).catch((e) => {
            console.log("Failed to load Olm: trying legacy version", e);
            return new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'olm_legacy.js'; // XXX: This should be cache-busted too
                s.onload = resolve;
                s.onerror = reject;
                document.body.appendChild(s);
            }).then(() => {
                // Init window.Olm, ie. the one just loaded by the script tag,
                // not 'Olm' which is still the failed wasm version.
                return window.Olm.init();
            }).then(() => {
                console.log("Using legacy Olm");
            }).catch((e) => {
                console.log("Both WebAssembly and asm.js Olm failed!", e);
            });
        });
    }

    CreateClient(homeserve){
        this.homeserve = homeserve;
        this.registrationClient = matrixcs.createClient(homeserve);
        console.log(this.registrationClient)
    }
    
    checkHomeServer(homeserver) {
        const self = this
        this.CreateClient(homeserver);
        return this.registrationClient.loginFlows().then(function(result) {
            self._flows = result.flows;
            return self._flows;
        });
    }

    logout() {
      if(!window.localStorage) {
        return;
      }
      window.localStorage.clear();
    }

    getStorageLocale() {
      if(!window.localStorage) {
        return undefined;
      }

      return window.localStorage.getItem("mx_i18n_locale");
    }

    setCurLanguage(language) {
      if(language != undefined && language.length != 0){
        this.curLanguage = language;
      }
    }

    async restoreFromLocalStorage() {
      if(!window.localStorage) {
          return false;
      }
      const hsUrl = window.localStorage.getItem("mx_hs_url");
      const accessToken = window.localStorage.getItem("mx_access_token");
      const userId = window.localStorage.getItem("mx_user_id");
      const deviceId = window.localStorage.getItem("mx_device_id");
      this.curLanguage = window.localStorage.getItem("mx_i18n_locale");

      if(accessToken && userId && hsUrl) {
        let ops = {
          baseUrl: hsUrl,
          userId: userId,
          accessToken: accessToken,
          deviceId: deviceId,
        }
        this.matrixClient = this._CreateMatrixClient(ops);
        await this.matrixClient.initCrypto();
        // await this.matrixClient.startClient();
        await this.matrixClient.store.startup();
        ops["language"] = this.curLanguage;
        return ops;
      }
      return undefined;
    }

    _CreateMatrixClient(opts) {
        let indexedDB = window.indexedDB;
        let localStorage = window.localStorage;
        localStorage.setItem("mx_hs_url", opts.baseUrl);
        localStorage.setItem("mx_user_id", opts.userId);
        localStorage.setItem("mx_access_token", opts.accessToken);
        localStorage.setItem("mx_device_id", opts.deviceId);
        localStorage.setItem("mx_i18n_locale", this.curLanguage);
        const storeOpts = {
            useAuthorizationHeader: true,
        };

        if (indexedDB && localStorage) {
            storeOpts.store = new matrixcs.IndexedDBStore({
                indexedDB: indexedDB,
                dbName: "riot-web-sync",
                localStorage: localStorage,
                workerScript: ""
            });
        }
  
        if (localStorage) {
            storeOpts.sessionStore = new matrixcs.WebStorageSessionStore(localStorage);
        }
  
        if (indexedDB) {
            storeOpts.cryptoStore = new matrixcs.IndexedDBCryptoStore(
                indexedDB, "matrix-js-sdk:crypto",
            );
        }
  
        opts = Object.assign(storeOpts, opts);
        return matrixcs.createClient(opts);
    }

    async LoginWithPassword(account, password){
        let userLoginResult = await this.registrationClient.loginWithPassword(
            account,
            password);
            let ops = {
                baseUrl: this.homeserve,
                userId: userLoginResult.user_id,
                accessToken: userLoginResult.access_token,
                deviceId: userLoginResult.device_id,
              }
        this.matrixClient = this._CreateMatrixClient(ops);
        await this.matrixClient.initCrypto();
        //await this.matrixClient.startClient();
        await this.matrixClient.store.startup();
        return this.matrixClient;
    }

    extendMatrixClient() {
        let datathis = this;
        let matrixClient = this.matrixClient
      // automatic join
        matrixClient.on('RoomMember.membership', async (event, member) => {
          if (member.membership === 'invite' && member.userId === matrixClient.getUserId()) {
            console.log("join room:" + member.roomId);
            await matrixClient.joinRoom(member.roomId)
            // setting up of room encryption seems to be triggered automatically
            // but if we don't wait for it the first messages we send are unencrypted
            await matrixClient.setRoomEncryption(member.roomId, { algorithm: 'm.megolm.v1.aes-sha2' })
          }
        })
  
        matrixClient.onDecryptedMessage = message => {
          //datathis.recvEncyptoMessage += message + '\n';
          console.log('Got encrypted message: ', message)
        }
  
        matrixClient.on('Event.decrypted', (event) => {
          if (event.getType() === 'm.room.message') {
            matrixClient.onDecryptedMessage(event.getContent().body)
          } else {
            console.log('decrypted an event of type', event.getType())
            console.log(event)
          }
        })
  
        matrixClient.createEncryptedRoom = async function (usersToInvite) {
          const {
            room_id: roomId
          } = await this.createRoom({
            visibility: 'private',
            invite: usersToInvite
          })
  
          // matrixClient.setRoomEncryption() only updates local state
          // but does not send anything to the server
          // (see https://github.com/matrix-org/matrix-js-sdk/issues/905)
          // so we do it ourselves with 'sendStateEvent'
          await this.sendStateEvent(
            roomId, 'm.room.encryption', ROOM_CRYPTO_CONFIG
          )
          await this.setRoomEncryption(
            roomId, ROOM_CRYPTO_CONFIG
          )
  
          // Marking all devices as verified
          let room = this.getRoom(roomId)
          let members = (await room.getEncryptionTargetMembers()).map(x => x['userId'])
          let memberkeys = await this.downloadKeys(members)
          for (const userId in memberkeys) {
            for (const deviceId in memberkeys[userId]) {
              await this.setDeviceVerified(userId, deviceId)
            }
          }
  
          return roomId
        }
  
        matrixClient.sendTextMessage = async function (message, roomId) {
          return matrixClient.sendMessage(
            roomId,
            {
              body: message,
              msgtype: 'm.text'
            }
          )
        }
  
        matrixClient.on('Room.timeline', function (event, room, toStartOfTimeline) {
          //datathis.recvMessage += event.event.content.body + "\n"
          console.log(event.event.content.body)
        })
    }
}

if (!window.mxMatrixClientPeg) {
    window.mxMatrixClientPeg = new _MatrixClientPeg();
    window.mxMatrixClientPeg.InitOlm();
}

export const MatrixClientPeg = window.mxMatrixClientPeg;


