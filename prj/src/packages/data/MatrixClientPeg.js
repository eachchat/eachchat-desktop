import olmWasmPath from "olm/olm.wasm"
import Olm from 'olm';
import * as matrixcs from 'matrix-js-sdk'
import {getDefaultLanguage} from '../../config.js';
import { decodeRecoveryKey } from 'matrix-js-sdk/src/crypto/recoverykey';
import {crossSigningCallbacks} from './recoveryKeyCallback.js';
import {getMatrixDefaultDeviceDisplayName} from '../core/Utils.js';

class _MatrixClientPeg{
    constructor(){
        this.matrixClient = undefined;
        this.homeserve = "";
        this.registrationClient = undefined;
        this.curLanguage = getDefaultLanguage();
        this.recoveryKey = '';
        this.defaultDisplayName = getMatrixDefaultDeviceDisplayName();
        this.roomToUser = null;
        console.log("default display name is ", this.defaultDisplayName);
    }

    _getUserToRooms() {
      if(!this.userToRooms) {
        var mDirectEvent = this.matrixClient.getAccountData('m.direct');
        this.mDirectEvent = this.mDirectEvent ? mDirectEvent.getContent() : {};
        var userToRooms = this.mDirectEvent;
        // var myUserId = this.matrixClient.getUserId();
        // var selfDMs = userToRooms[myUserId];
        this.userToRooms = userToRooms;
      }
      return this.userToRooms;
    }

    _populateRoomToUser() {
      this.roomToUser = {};
      for(var user of Object.keys(this._getUserToRooms())) {
        for(var roomId of this.userToRooms[user]) {
          this.roomToUser[roomId] = user;
        }
      }
    }

    getUserIdFroRoomId(roomId) {
      if(this.roomToUser == null) {
        this._populateRoomToUser();
      }
      if(this.roomToUser[roomId] == undefined) {
        var room = this.matrixClient.getRoom(roomId);
        if(room) {
          return room.getDMInviter();
        }
      }
      return this.roomToUser[roomId];
    }

    getRoomAvatar(theRoom) {
      var explicitRoomAvatar = theRoom.getAvatarUrl(this.matrixClient.getHomeserverUrl(), 40, 40, undefined, false);
      if(explicitRoomAvatar) {
        return explicitRoomAvatar;
      }
      var targetPath = "";
      var otherMember = null;
      var otherUserId = this.getUserIdFroRoomId(theRoom.roomId);
      if(otherUserId) {
        otherMember = theRoom.getMember(otherUserId);
      }
      else {
        otherMember = theRoom.getAvatarFallbackMember();
      }
      if(otherMember) {
        targetPath = otherMember.getAvatarUrl(this.matrixClient.getHomeserverUrl(), 40, 40, undefined, false);
        return targetPath;
      }
      return undefined;
    }

    getInviteMember(chatGroupItem) {
      if (!chatGroupItem) {
          return;
      }
      var myUserId = this.matrixClient.getUserId();
      var inviteEvent = chatGroupItem.currentState.getMember(myUserId);
      if (!inviteEvent) {
          return;
      }
      var inviterUserId = inviteEvent.events.member.getSender();
      return chatGroupItem.currentState.getMember(inviterUserId);
    }

    getMyMember(chatItem) {
        return chatItem.getMember(this.matrixClient.getUserId());
    }

    isDMInvite(chatItem) {
        var myMember = this.getMyMember(chatItem);
        if(!myMember) return false;
        var memberEvent = myMember.events.member;
        var memberContent = memberEvent.getContent();
        return memberContent.membership == "invite" && memberContent.is_direct;
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
      var organizationAddress = window.localStorage.getItem("mx_hs_url");
      var domain = window.localStorage.getItem("Domain");
      window.localStorage.clear();
      window.localStorage.setItem("mx_hs_url", organizationAddress);
      window.localStorage.setItem("Domain", domain);
      window.sessionStorage.clear();
      this.matrixClient.clearStores();
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
      const curlanguage = window.localStorage.getItem("mx_i18n_locale");
      if(curlanguage == null) {
        localStorage.setItem("mx_i18n_locale", this.curLanguage);
        console.log("============this.curlanguage is ", this.curLanguage);
      }
      if(accessToken && userId && hsUrl) {
        let ops = {
          baseUrl: hsUrl,
          userId: userId,
          accessToken: accessToken,
          deviceId: deviceId,
          cryptoCallbacks: {}
        }
        Object.assign(ops.cryptoCallbacks, crossSigningCallbacks);
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
                cryptoCallbacks: {}
              }
            Object.assign(ops.cryptoCallbacks, crossSigningCallbacks);
        this.matrixClient = this._CreateMatrixClient(ops);
        //await this.matrixClient.startClient();
        await this.matrixClient.store.startup();
        await this.matrixClient.initCrypto();
        return this.matrixClient;
    }

    async checkPrivateKey(recoveryKey) {
      this.recoveryKey = recoveryKey;
      var decodeKey = decodeRecoveryKey(this.recoveryKey);
      return await this.matrixClient.checkSecretStorageKey(decodeKey, this.keyInfo);
    }

    async validateRecoveryKey(recoveryKey) {
      this.recoveryKey = recoveryKey;
      if (recoveryKey === '') {
          return;
      }

      await this.fetchKeyInfo();

      try {
          const decodedKey = this.matrixClient.keyBackupKeyFromRecoveryKey(recoveryKey);
          const correct = await this.matrixClient.checkSecretStorageKey(
              decodedKey, this.keyInfo,
          );
          console.log("correct is ", correct);
          return correct;
      } catch (e) {
        return false;
      }
    }
    async fetchKeyInfo() {
      var keys = await this.matrixClient.isSecretStored('m.cross_signing.master', false);
      if(keys == null || Object.keys(keys).length == 0) {
        this.keyId = null;
        this.keyInfo = null;
      }
      else {
        this.keyId = Object.keys(keys)[0];
        this.keyInfo = keys[this.keyId];
      }
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

    getHomeserverName() {
      const matches = /^@.+:(.+)$/.exec(this.matrixClient.credentials.userId);
        if (matches === null || matches.length < 1) {
            throw new Error("Failed to derive homeserver name from user ID!");
        }
        return matches[1];
    }

}

if (!window.mxMatrixClientPeg) {
    window.mxMatrixClientPeg = new _MatrixClientPeg();
    window.mxMatrixClientPeg.InitOlm();
}

export const MatrixClientPeg = window.mxMatrixClientPeg;


