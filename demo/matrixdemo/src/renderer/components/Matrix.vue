<template>
    <div>
        <p>登陆</p>
        <input placeholder="homeserver:"/>
        <input placeholder="用户名:"/>
        <input placeholder="密码:"/>
        <input type="button" value="登陆" @click="loginClick();"/>
        <p>发送</p>
        <input v-model = "message" class="message" placeholder="输入:"/>
        <input type="button"  value="发送" @click="sendClick();"/>
        <p>接收</p>
        <input v-model = "recvMessage" disabled='true'/>

    </div>

</template>

<script>
//global.Olm = require('olm')
import olmWasmPath from "olm/olm.wasm"
import Olm from 'olm';
import * as matrixcs from 'matrix-js-sdk'

const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' }
export default {
  name: 'matrix-page',
  data () {
    return {
      password: '',
      message: '',
      recvMessage: ''
    }
  },
  methods: {
    extendMatrixClient: function (matrixClient) {
    // automatic join
      matrixClient.on('RoomMember.membership', async (event, member) => {
        if (member.membership === 'invite' && member.userId === matrixClient.getUserId()) {
          await matrixClient.joinRoom(member.roomId)
          // setting up of room encryption seems to be triggered automatically
          // but if we don't wait for it the first messages we send are unencrypted
          await matrixClient.setRoomEncryption(member.roomId, { algorithm: 'm.megolm.v1.aes-sha2' })
        }
      })

      matrixClient.onDecryptedMessage = message => {
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
       console.log("-----------------:" + olmWasmPath)
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


    loginClick: async function () {
      console.log('login test')
      const BASE_URL = 'https://matrix.each.chat'
      const ROOM_CRYPTO_CONFIG = { algorithm: 'm.megolm.v1.aes-sha2' }
      const PASSWORD = 'password'

      const registrationClient = matrixcs.createClient(BASE_URL)
      console.log(registrationClient)

      this.loadOlm();
      
      const userRegisterResult = await registrationClient.loginWithPassword(
        '@chengfang1.ai:matrix.each.chat',
        'cf87420323')
      this.matrixClient = matrixcs.createClient({
        baseUrl: BASE_URL,
        userId: userRegisterResult.user_id,
        accessToken: userRegisterResult.access_token,
        deviceId: userRegisterResult.device_id,
        sessionStore: new matrixcs.WebStorageSessionStore(window.localStorage),
        cryptoStore: new matrixcs.MemoryCryptoStore()
      })
      console.log("begin initCrypto")
      await this.matrixClient.initCrypto()
      console.log("end initCrypto")
      this.extendMatrixClient(this.matrixClient);

      let datathis = this
      this.matrixClient.on('Room.timeline', function (event, room, toStartOfTimeline) {
        datathis.recvMessage = event.event.content.body
      })
      await this.matrixClient.startClient()
    },

    sendClick: function () {
      let response = this.matrixClient.sendMessage(
        '!UxDCsmenjhSfAqeVYc:matrix.each.chat',
        {
          body: this.message,
          msgtype: 'm.text'
        }
      )
      console.log(response)
      return this.matrixClient
    }
    // ""
  }
}
</script>

<style>
.message{
    width: 500px
}

</style>