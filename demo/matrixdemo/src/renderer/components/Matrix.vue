<template>
    <div class="column-flex" style="height: 100%; margin: 0;" data-vector-indexeddb-worker-script="./IndexeddbWorker.js">
      <div>
        <p>登陆</p>
        <input placeholder="homeserver:"/>
        <input placeholder="用户名:"/>
        <input placeholder="密码:"/>
        <input type="button" value="登陆" @click="loginClick();"/>
      </div>
      <div>
        <p><input v-model="roomID" placeholder="room" type="text">发送普通消息
        <input v-model= "message" class="message" placeholder="输入:"/>
        <input type="button"  value="发送" @click="sendClick();"/>
        接收普通消息
        <textarea rows="5" v-model = "recvMessage"/>
        </p>
        <p><input v-model="secRoomID" placeholder="room" type="text">发送加密消息
        <input v-model= "encryptMessage" class="message" placeholder="输入:"/>
        <input type="button"  value="发送" @click="secSendClick();"/>
        接收加密消息
        <textarea rows="5" v-model = "recvEncyptoMessage"/>
        </p>
      </div>
      <div class="row-flex">
        <ul type='circle'>public room
          <li v-for="item in publicRooms" :key='item.room_id'>{{item}}</li>
        </ul>
        <ul type='circle'>
          <li>1111</li>
          <li>2222</li>
          <li>3333</li>
        </ul>
        <div>
          <p>加入room</p>
          <p>退出room</p>
        </div>
      </div>
    </div>

</template>

<style>
.column-flex{
  display: flex;
  flex-direction: column;
}

.row-flex{
  display: flex;
  flex-direction: row;
}

.message{
    width: 200px
}
</style>
<script>

//global.Olm = require('olm')
import olmWasmPath from "olm/olm.wasm"
import Olm from 'olm';
import * as matrixcs from 'matrix-js-sdk'
//import "./IndexeddbWorker.js"
const path = require('path')

//global.onmessage = onmessage;

const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' }
export default {
  name: 'matrix-page',
  data () {
    return {
      password: '',
      message: '',
      encryptMessage: '',
      recvMessage: '',
      recvEncyptoMessage: '',
      publicRooms:[],
      roomID: "!UxDCsmenjhSfAqeVYc:matrix.each.chat",
      secRoomID: "!cbqrxXqqkjFkcwPpAf:matrix.each.chat"
    }
  },
  methods: {
    extendMatrixClient: function (matrixClient) {
      let datathis = this
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
        datathis.recvEncyptoMessage += message + '\n';
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
        datathis.recvMessage += event.event.content.body + "\n"
      })
    },

    loadOlm : function () {
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
    },

    createMatrixClient : function(opts) {
      let indexedDB = window.indexedDB;
      let localStorage = window.localStorage;
      const storeOpts = {
          useAuthorizationHeader: true,
      };
      let scriptPath = path.join(__dirname, '/IndexeddbWorker.js');
      //scriptPath = ''
      let scriptPath1 =  document.body.dataset.vectorIndexeddbWorkerScript;
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
    },


    loginClick: async function () {
      const BASE_URL = 'https://matrix.each.chat'
      const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' }
      const PASSWORD = 'password'

      const registrationClient = matrixcs.createClient(BASE_URL)
      this.loadOlm();
      
      const userRegisterResult = await registrationClient.loginWithPassword(
        '@chengfang1.ai:matrix.each.chat',
        'cf87420323')
      /*
      const userRegisterResult = {
        user_id: "@chengfang1.ai:matrix.each.chat",
        access_token: "MDAxZWxvY2F0aW9uIG1hdHJpeC5lYWNoLmNoYXQKMDAxM2lkZW50aWZpZXIga2V5CjAwMTBjaWQgZ2VuID0gMQowMDMyY2lkIHVzZXJfaWQgPSBAY2hlbmdmYW5nMS5haTptYXRyaXguZWFjaC5jaGF0CjAwMTZjaWQgdHlwZSA9IGFjY2VzcwowMDIxY2lkIG5vbmNlID0gMUhjPTNUaE06Rjl5WSY2YwowMDJmc2lnbmF0dXJlIPZS0_Iunx9nrqvcATvDW",
        device_id: "PJFMQGTIJL"
      }
      */
      let ops = {
        baseUrl: BASE_URL,
        userId: userRegisterResult.user_id,
        accessToken: userRegisterResult.access_token,
        deviceId: userRegisterResult.device_id,
      }
 
      this.matrixClient = this.createMatrixClient(ops)
      await this.matrixClient.initCrypto()
      this.extendMatrixClient(this.matrixClient);
      let thisdata = this;
      
      this.matrixClient.publicRooms(function(err, data) {
          thisdata.publicRooms = data.chunk;
        });
      await this.matrixClient.store.startup();
      await this.matrixClient.startClient()
      console.log("-----------------")
      let rooms = this.matrixClient.getRooms();
      console.log(rooms)
      let room = this.matrixClient.getRoom(this.secRoomID)
      console.log(room)
      //await this.matrixClient.joinRoom(this.secRoomID);
      //await this.matrixClient.setDeviceVerified(userRegisterResult.user_id, userRegisterResult.device_id);
      //let tmproomId = await this.matrixClient.createEncryptedRoom(["@chengfang.ai:matrix.each.chat", "@test01:matrix.each.chat"]);
      //console.log(tmproomId)
      //await this.matrixClient.sendTextMessage('Hi Alice!', tmproomId);
    },

    sendClick: function () {
      let response = this.matrixClient.sendMessage(
        this.roomID,
        {
          body: this.message,
          msgtype: 'm.text'
        }
      )
      console.log(response)
      return this.matrixClient
    },
    secSendClick: async function(){
      console.log("begin send")
      let res = await this.matrixClient.sendMessage(
        this.secRoomID,
        {
          body: this.encryptMessage,
          msgtype: 'm.text'
        }
      );
      console.log(res)
      return this.matrixClient
    }
    // ""
  }
}
</script>
