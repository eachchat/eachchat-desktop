import olmWasmPath from "olm/olm.wasm"
import Olm from 'olm';
import * as matrixcs from 'matrix-js-sdk'
import {getDefaultLanguage} from '../../config.js';
import { decodeRecoveryKey } from 'matrix-js-sdk/src/crypto/recoverykey';
import {crossSigningCallbacks} from './recoveryKeyCallback.js';
import {getMatrixDefaultDeviceDisplayName} from '../core/Utils.js';
import DMRoomMap from './DMRoomMap';
import { net } from '../core/index.js'

class _MatrixClientPeg{
    constructor(){
        this.matrixClient = undefined;
        this.homeserve = "";
        this.registrationClient = undefined;
        this.curLanguage = getDefaultLanguage();
        this.recoveryKey = '';
        this.defaultDisplayName = getMatrixDefaultDeviceDisplayName();
        this.roomToUser = null;
        this.userToRooms = null;
        console.log("default display name is ", this.defaultDisplayName);
        this._hasSentOutPatchDirectAccountDataPatch = false;
    }

    getRoomAvatar(theRoom) {
      var explicitRoomAvatar = theRoom.getAvatarUrl(this.matrixClient.getHomeserverUrl(), 40, 40, undefined, false);
      if(explicitRoomAvatar) {
        return explicitRoomAvatar;
      }
      var targetPath = "";
      var otherMember = null;
      var otherUserId = DMRoomMap.shared().getUserIdForRoomId(theRoom.roomId);
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

    getHostPortTls(BaseUrl) {
      let IHostTls = 1;
      let IHost = "";
      let IHostPort = 443;
      if(BaseUrl.toLowerCase().indexOf("https://") >= 0) {
        let IHostTmp = BaseUrl.split("https://")[1];
        if(IHostTmp.indexOf(":") >= 0) {
          IHost = IHostTmp.split(":")[0];
          IHostPort = IHostTmp.split(":")[1];
        }
        else {
          IHost = IHostTmp;
          IHostPort = 443;
        }
        IHostTls = 1;
      }
      else if(BaseUrl.toLowerCase().indexOf("http://") >= 0) {
        let IHostTmp = BaseUrl.split("http://")[1];
        if(IHostTmp.indexOf(":") >= 0) {
          IHost = IHostTmp.split(":")[0];
          IHostPort = IHostTmp.split(":")[1];
        }
        else {
          IHost = IHostTmp;
          IHostPort = 80;
        }
        IHostTls = 0;
      }
      else {
        IHost = BaseUrl;
        IHostPort = 443;
      }
      return [IHost, IHostPort, IHostTls];
    }
    
    checkHomeServer(homeserver) {
        this.CreateClient(homeserver);
        return this.registrationClient.loginFlows().then(async (result) => {
          var tls = 1;
          var hostname = '';
          var port = '';
          var obj = this.getHostPortTls(homeserver);
          hostname = obj[0];
          port = obj[1];
          tls = obj[2];
          this.commonApi = new net.HTTP(hostname, port, tls);
          
          this._flows = result.flows;
          return this._flows;
        });
    }

    async getAppServerInfo() {
      let response = null;

      response = await this.commonApi.get(
        "/.well-known/matrix/client");

      var ret = this.parseStatus(response);
      return ret;
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
        DMRoomMap.makeShared().start();
  
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
    
    /*
    {
      "medium": "email或msisdn，必须"//此处emial和msisdn须为Identity Server上已完成注册，并在HomeServer中与matrixId已完成绑定
      "address": "手机号码或邮箱地址，必须",
    }
    */
    async GetVerCode(medium, address){
      let response = await this.commonApi.post(
        "/_matrix/client/r0/login/getvercode",
        {
          medium: medium,
          address: address
        });
      console.log("response is ", response);
      return this.parseStatus(response);
    }

    async LoginWithVerCode(checkType, username, password) {
      let response = null;
      if(checkType == "m.login.verCode.msisdn") {
        try{
          response = await this.commonApi.post(
            "/_matrix/client/r0/login",
            {
              'type': checkType,
              'msisdn': username,
              'ver_code': password
            });
        }
        catch(e) {
          console.log(e.message);
        }
      }
      else if(checkType == "m.login.verCode.email") {
        response = await this.commonApi.post(
          "/_matrix/client/r0/login",
          {
            type: checkType,
            email: username,
            ver_code: password
          });
      }
      else {
        return "Unknown type";
      }

      var ret = this.parseStatus(response);
      return ret;
    }

    async verCodeLoginMatrixClient(matrixInfo) {
      let ops = {
          baseUrl: this.homeserve,
          userId: matrixInfo.data.user_id,
          accessToken: matrixInfo.data.access_token,
          deviceId: matrixInfo.data.device_id,
          cryptoCallbacks: {}
      }
      Object.assign(ops.cryptoCallbacks, crossSigningCallbacks);
      this.matrixClient = this._CreateMatrixClient(ops);
      
      DMRoomMap.makeShared().start();

      await this.matrixClient.store.startup();
      await this.matrixClient.initCrypto();
      return this.matrixClient;
    }

    parseStatus(response) {
      if (typeof response != "object") {
        return response;
      }
  
      Object.defineProperty(response, 'success', {
        get() {
          if (!("data" in this)) {
            return false;
          }
  
          if (!("code" in this.data)) {
            return false;
          }
  
          if(this.data.code == 401)
          {
            ipcRenderer.send('token-expired');
            if(this.mqtt != undefined)
            {
              this.mqtt.close();
              this.service.logout();
            }
          }
  
          return this.data.code >= 200 && this.data.code < 300;
        }
      });
  
      return response;
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
        DMRoomMap.makeShared().start();
  
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

