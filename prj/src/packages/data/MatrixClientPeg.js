import olmWasmPath from "olm/olm.wasm"
import Olm from 'olm';
import * as matrixcs from 'matrix-js-sdk'
import {getDefaultLanguage} from '../../config.js';
import { decodeRecoveryKey } from 'matrix-js-sdk/src/crypto/recoverykey';
import {crossSigningCallbacks} from './recoveryKeyCallback.js';
import {getMatrixDefaultDeviceDisplayName} from '../core/Utils.js';
import DMRoomMap from './DMRoomMap';
import DeviceListener from './DeviceListener.js';
import { net } from '../core/index.js'

const EMAIL_ADDRESS_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
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
        this._isLoggingOut = false;
        this.keyInfo = null;
        this.accountPassword = null;
        this.loadType = null;
        this.checkType = null;
        this.account = null;
        console.log("default display name is ", this.defaultDisplayName);
        this._hasSentOutPatchDirectAccountDataPatch = false;
        this.mediaConfig = null;
        this.callList = {};
    }

    addCall(roomId, call) {
      this.callList[roomId] = call;
    }

    removeCall(roomId) {
        try{
            delete this.callList[roomId];
        }
        catch(e) {

        }
    }

    getCall(roomId) {
      return this.callList[roomId];
    }

    setRecoveryKey(recoveryKey) {
      this.recoveryKey = recoveryKey;
    }

    mxGetMembers(theRoom) {
      const roomId = theRoom.roomId;
      const cli = this.matrixClient;
      const xie1 = cli.getRoom(roomId);
      const xie2 = cli.getRoomPushRule("global", roomId);
      const mxMembers = [];
      for(let key in xie1.currentState.members) {
          // let isAdmin = xie1.currentState.members[key].powerLevel == 100; 
          let obj = {...xie1.currentState.members[key], choosen:false}
          if (obj.membership != 'leave') mxMembers.push(obj);
      }
      console.log('mxMembers', mxMembers);
      if (xie1.currentState.members[cli.getUserId()]) this.currentUser = xie1.currentState.members[cli.getUserId()];
      console.log('----mxMembers[userId]----', cli.getUserId())
      return mxMembers;
    }

    looksValid(email) {
      return EMAIL_ADDRESS_REGEX.test(email);
    }

    getDMMemberId(theRoom) {
      var distUserId = undefined;
      var selfUserId = this.matrixClient.getUserId();
      if(this.DMCheck(theRoom)) {
        var otherUserId = DMRoomMap.shared().getUserIdForRoomId(theRoom.roomId);
        if(!otherUserId) {
          var roomMembers = this.mxGetMembers(theRoom);
          roomMembers = roomMembers.map(m => {
              if (m.userId != selfUserId) {
                distUserId = m.userId;
              }
          });
        }
        else {
          distUserId = otherUserId;
        }
      }
      return distUserId;
    }

    getRoomAvatar(theRoom) {
      if(this.DMCheck(theRoom)) {
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
          targetPath = otherMember.getAvatarUrl(this.matrixClient.getHomeserverUrl(), null, null, undefined, false);
          return targetPath;
        }
        return undefined;
      }
      else {
        var explicitRoomAvatar = theRoom.getAvatarUrl(this.matrixClient.getHomeserverUrl(), null, null, undefined, false);
        if(explicitRoomAvatar) {
          return explicitRoomAvatar;
        }
        return undefined;
      }
    }

    updageChatUnreadState(chatUnreadStateInfo) {
      if(window.localStorage) {
        var jsonData = {};
        var getStrJsonData = window.localStorage.getItem("ChatUnreadState");
        if(getStrJsonData) {
          jsonData = JSON.parse(getStrJsonData);
        }
        jsonData[chatUnreadStateInfo[0]] = chatUnreadStateInfo[1];
        var strJsonData = JSON.stringify(jsonData);
        window.localStorage.setItem('ChatUnreadState', strJsonData);
      }
    }

    getChatUnreadState(roomId) {
      if(window.localStorage) {
        var getStrJsonData = window.localStorage.getItem("ChatUnreadState");
        if(!getStrJsonData) return false;
        var getJsonData = JSON.parse(getStrJsonData);
        return getJsonData[roomId] == undefined ? false : getJsonData[roomId];
      }
      return false;
    }

    DMCheck(curRoomItem) {
      const client = this.matrixClient;
      const mDirectEvent = client.getAccountData('m.direct');
      let dmRoomMap = {};
      if (mDirectEvent !== undefined) dmRoomMap = mDirectEvent.getContent();
      let currentRoom = curRoomItem;
      let dmRoomIdArr = [];
      const roomId = currentRoom.roomId;
      const userId = client.getUserId();
      Object.keys(dmRoomMap).forEach(k=>{
          let arr = dmRoomMap[k];
          arr.forEach(a=>dmRoomIdArr.push(a))
      })
      if (dmRoomIdArr.includes(roomId)) {
          return true;
      } else {return false;}
    }

    SendEvent(roomId, event) {
      const cli = this.matrixClient;
      return cli.sendEvent(roomId, event.getType(), event.getContent()).then(() => {
          return true;
      }, (err) => {
          return false;
      });
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

    getDMLeaveMember(chatItem){
      let members = chatItem.currentState.members;
      for(let item in members){
        if(members[item].userId !== this.matrixClient.getUserId())
          return members[item].userId;
      }
    }

    getMyMember(chatItem) {
        return chatItem.getMember(this.matrixClient.getUserId());
    }

    isDMInvite(chatItem) {
        var myMember = this.getMyMember(chatItem);
        if(!myMember) return false;
        var memberEvent = myMember.events.member;
        var memberContent = memberEvent.getContent();
        return memberContent.is_direct;
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
      try{
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
      catch(e) {
        console.log("Chaek Home Server Exception ", e.message);
        return false;
      }
    }

    async setPassword(sid, client_secret, newPwd) {
      try{
        var ret = await this.commonApi.sender.post(
          "/_matrix/client/r0/account/password",
          {
            auth: {
              type:"m.login.email.identity",
              threepid_creds: {
                sid: sid,
                client_secret: client_secret
              }
            },
            new_password: newPwd
          });

          return this.parseStatus(ret);
      }
      catch(error) {
        console.log("err ", error.response);
        return error.response;
      }
    }

    async getAppServerInfo(host) {
      var obj = this.getHostPortTls(host);
      var hostname = obj[0];
      var port = obj[1];
      var tls = obj[2];
      this.commonApi = new net.HTTP(hostname, port, tls);
      try{
        var ret = await await this.commonApi.sender.get(
          "/.well-known/matrix/client");

          return this.parseStatus(ret);
      }
      catch(error) {
        console.log("err ", error.response);
        return error.response;
      }
    }

    logout() {
      if(!window.localStorage) {
        return;
      }
      var organizationAddress = window.localStorage.getItem("mx_hs_url");
      var domain = window.localStorage.getItem("Domain");
      var appServer = window.localStorage.getItem("app_server");
      window.localStorage.clear();
      window.localStorage.setItem("mx_hs_url", organizationAddress);
      window.localStorage.setItem("Domain", domain);
      window.localStorage.setItem("app_server", appServer);
      window.sessionStorage.clear();
      if(this.matrixClient)
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
      // const hsUrl = "https://matrix.each.chat";
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
          baseUrl: this.homeserve,
          userId: userId,
          accessToken: accessToken,
          deviceId: deviceId,
          cryptoCallbacks: {},
          timelineSupport: true,
          unstableClientRelationAggregation: true,
        }
        Object.assign(ops.cryptoCallbacks, crossSigningCallbacks);
        try {
          this.matrixClient = this._CreateMatrixClient(ops);
        }
        catch(e) {
          console.log("Restore Token exception ", e.message);
          return undefined;
        }
        DMRoomMap.makeShared().start();
  
        await this.matrixClient.initCrypto();
        // await this.matrixClient.startClient();
        await this.matrixClient.store.startup();
        DeviceListener.sharedInstance().start();
        ops["language"] = this.curLanguage;
        return ops;
      }
      return undefined;
    }

    _CreateMatrixClient(opts) {
        let indexedDB = window.indexedDB;
        let localStorage = window.localStorage;
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
    
    async GetVerCode(medium, address){
      try{
        var ret = await this.commonApi.sender.post(
          "/_matrix/client/r0/login/getvercode",
          {
            medium: medium,
            address: address
          });

          return this.parseStatus(ret);
      }
      catch(error) {
        console.log("err ", error.response);
        return error.response;
      }
    }

    async LoginWithVerCode(checkType, username, password, deviceName="") {
      let response = null;
      this.checkType = checkType;
      this.account = username;
      this.password = password;
      if(checkType == "m.login.verCode.msisdn") {
        try{
          response = await this.commonApi.sender.post(
            "/_matrix/client/r0/login",
            {
              'type': checkType,
              'msisdn': username,
              'ver_code': password,
              'initial_device_display_name': deviceName
            });
        }
        catch(e) {
          console.log(e.response);
          return e.response;
        }
      }
      else if(checkType == "m.login.verCode.email") {
        try{
          response = await this.commonApi.sender.post(
            "/_matrix/client/r0/login",
            {
              type: checkType,
              email: username,
              ver_code: password,
              initial_device_display_name: deviceName
            });
        }
        catch(e) {
          console.log(e.response);
          return e.response;
        }
      }
      else if(checkType == "m.login.sso.ldap") {
        try{
          response = await this.commonApi.sender.post(
            "/_matrix/client/r0/login",
            {
              type: checkType,
              user: username,
              password: password,
              initial_device_display_name: deviceName
            });
        }
        catch(e) {
          console.log(e.response);
          return e.response;
        }
      }
      else {
        return "Unknown type";
      }

      this.accountPassword = password;
      
      localStorage.setItem("loginAccount", username);
      console.log("===== r", response);
      var ret = this.parseStatus(response);
      return ret;
    }

    async verCodeLoginMatrixClient(matrixInfo) {
      let ops = {
          baseUrl: this.homeserve,
          userId: matrixInfo.data.user_id,
          accessToken: matrixInfo.data.access_token,
          deviceId: matrixInfo.data.device_id,
          cryptoCallbacks: {},
          timelineSupport: true,
          unstableClientRelationAggregation: true,
      }
      try {
        window.sessionStorage.clear();
        if(this.matrixClient)
          await this.matrixClient.clearStores();
      }
      catch(err) {

      }
      Object.assign(ops.cryptoCallbacks, crossSigningCallbacks);
      this.matrixClient = this._CreateMatrixClient(ops);
      
      DMRoomMap.makeShared().start();

      await this.matrixClient.initCrypto();
      await this.matrixClient.store.startup();
      DeviceListener.sharedInstance().start();
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
  
    async LoginWithPassword(account, password, deviceName=""){
        try {
          window.sessionStorage.clear();
          if(this.matrixClient)
            await this.matrixClient.clearStores();
        }
        catch(err) {
          
        }
        this.checkType = 'm.login.password';
        var identifier = {};
        if(this.looksValid(account)) {
          identifier["medium"] = "email";
          identifier["address"] = account;
          identifier["type"] = "m.id.thirdparty";
        }
        else {
          identifier["user"] = account;
          identifier["type"] = 'm.id.user';
        }
        var loginParams = {
          password,
          identifier,
          initial_device_display_name: deviceName,
        };
        this.account = account;
        this.password = password;
        // let userLoginResult = await this.registrationClient.loginWithPassword(
        //     account,
        //     password);
        let userLoginResult = await this.registrationClient.login(this.checkType, loginParams);
        console.log("**** userLoginResult ", userLoginResult);
        let ops = {
            baseUrl: this.homeserve,
            userId: userLoginResult.user_id,
            accessToken: userLoginResult.access_token,
            deviceId: userLoginResult.device_id,
            cryptoCallbacks: {},
            timelineSupport: true,
            unstableClientRelationAggregation: true,
          }
        Object.assign(ops.cryptoCallbacks, crossSigningCallbacks);
        this.matrixClient = this._CreateMatrixClient(ops);
        DMRoomMap.makeShared().start();
  
        await this.matrixClient.initCrypto();
        await this.matrixClient.store.startup();
        DeviceListener.sharedInstance().start();
        return this.matrixClient;
    }

    async LoginWithAuth2(data){
        let ops = {
          baseUrl: data["well_known"]["m.homeserver"]["base_url"],
          userId: data.user_id,
          accessToken: data.access_token,
          deviceId: data.device_id,
          cryptoCallbacks: {},
          timelineSupport: true,
          unstableClientRelationAggregation: true,
        }
      Object.assign(ops.cryptoCallbacks, crossSigningCallbacks);
      this.matrixClient = this._CreateMatrixClient(ops);
      DMRoomMap.makeShared().start();

      await this.matrixClient.initCrypto();
      await this.matrixClient.store.startup();
      DeviceListener.sharedInstance().start();
      return this.matrixClient;
    }

    ensureMediaConfigFetched() {
      if (this.mediaConfig !== null) return;

      console.log("[Media Config] Fetching");
      return this.matrixClient.getMediaConfig().then((config) => {
          console.log("[Media Config] Fetched config:", config);
          return config;
      }).catch(() => {
          // Media repo can't or won't report limits, so provide an empty object (no limits).
          console.log("[Media Config] Could not fetch config, so not limiting uploads.");
          return {};
      }).then((config) => {
          this.mediaConfig = config;
      });
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
          return {recoveryKeyValid: true, recoveryKeyCorrect: correct};
      } catch (e) {
        return {recoveryKeyValid: false, recoveryKeyCorrect: false};
      }
    }
    async fetchKeyInfo() {
      console.log("```````````````matrixClientPeg.keyInfo ", this.keyInfo);
      var keys = await this.matrixClient.isSecretStored('m.cross_signing.master', false);
      if(keys == null || Object.keys(keys).length == 0) {
        this.keyId = null;
        this.keyInfo = null;
      }
      else {
        this.keyId = Object.keys(keys)[0];
        this.keyInfo = keys[this.keyId];
        console.log("```````````````fetchKeyInfo.keyId ", this.keyId);
        console.log("```````````````fetchKeyInfo.keyInfo ", this.keyInfo);
      }
    }

    softLogout() {
        if (!this.matrixClient) return;
    
        // Track that we've detected and trapped a soft logout. This helps prevent other
        // parts of the app from starting if there's no point (ie: don't sync if we've
        // been soft logged out, despite having credentials and data for a MatrixClient).
        localStorage.setItem("mx_soft_logout", "true");
    
        // Dev note: please keep this log line around. It can be useful for track down
        // random clients stopping in the middle of the logs.
        console.log("Soft logout initiated");
        this._isLoggingOut = true; // to avoid repeated flags
        // Ensure that we dispatch a view change **before** stopping the client so
        // so that React components unmount first. This avoids React soft crashes
        // that can occur when components try to use a null client.
        stopMatrixClient(/*unsetClient=*/false);
        // DO NOT CALL LOGOUT. A soft logout preserves data, logout does not.
    }

    stopMatrixClient(unsetClient=true) {
      // DeviceListener.sharedInstance().stop();
      if (DMRoomMap.shared()) DMRoomMap.shared().stop();
      const cli = this.matrixClient;
      if (cli) {
          cli.stopClient();
          cli.removeAllListeners();
  
          if (unsetClient) {
              MatrixClientPeg.unset();
              EventIndexPeg.unset();
          }
      }
    }

    isLoggingOut() {
      return this._isLoggingOut;
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


