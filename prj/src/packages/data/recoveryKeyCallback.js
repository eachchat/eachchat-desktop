import { decodeRecoveryKey } from 'matrix-js-sdk/src/crypto/recoverykey';
    /**
     * Encode a typed array of uint8 as base64.
     * @param {Uint8Array} uint8Array The data to encode.
     * @return {string} The base64.
     */
    function encodeBase64(uint8Array) {
        return Buffer.from(uint8Array).toString("base64");
      }

    async function getSecretStorageKey({ keys: keyInfos }, ssssItemName) {
        console.log("getSecretStorageKey callback and keys is ", keyInfos);
        const keyInfoEntries = Object.entries(keyInfos);
        if (keyInfoEntries.length > 1) {
            throw new Error("Multiple storage key requests not implemented");
        }
        const [name, info] = keyInfoEntries[0];
    
        // // Check the in-memory cache
        // if (isCachingAllowed() && secretStorageKeys[name]) {
        //     return [name, secretStorageKeys[name]];
        // }
    
        const inputToKey = async ({ passphrase, recoveryKey }) => {
            // if (passphrase) {
            //     return deriveKey(
            //         passphrase,
            //         info.passphrase.salt,
            //         info.passphrase.iterations,
            //     );
            // } else {
                return decodeRecoveryKey(recoveryKey);
            // }
        };
        // const { finished } = Modal.createTrackedDialog("Access Secret Storage dialog", "",
        //     AccessSecretStorageDialog,
        //     /* props= */
        //     {
        //         keyInfo: info,
        //         checkPrivateKey: async (input) => {
        //             const key = await inputToKey(input);
        //             return await MatrixClientPeg.get().checkSecretStorageKey(key, info);
        //         },
        //     },
        //     /* className= */ null,
        //     /* isPriorityModal= */ false,
        //     /* isStaticModal= */ false,
        //     /* options= */ {
        //         onBeforeClose: async (reason) => {
        //             if (reason === "backgroundClick") {
        //                 return confirmToDismiss();
        //             }
        //             return true;
        //           },
        //       },
        //   );
        if(global.mxMatrixClientPeg.recoveryKey.length == 0) {
            return;
        }
          const input = {recoveryKey: global.mxMatrixClientPeg.recoveryKey};
          if (!input) {
              throw new AccessCancelledError();
          }
          const key = await inputToKey(input);
      
          // // Save to cache to avoid future prompts in the current session
          // if (isCachingAllowed()) {
          //     secretStorageKeys[name] = key;
          // }
      
          return [name, key];
      }
      
const onSecretRequested = async function({
        user_id: userId,
        device_id: deviceId,
        request_id: requestId,
        name,
        device_trust: deviceTrust,
      }) {
        console.log("onSecretRequested", userId, deviceId, requestId, name, deviceTrust);
        const client = global.mxMatrixClientPeg.matrixClient;
        if (userId !== client.getUserId()) {
            return;
        }
        if (!deviceTrust || !deviceTrust.isVerified()) {
            console.log(`CrossSigningManager: Ignoring request from untrusted device ${deviceId}`);
            return;
        }
        if (
            name === "m.cross_signing.master" ||
            name === "m.cross_signing.self_signing" ||
            name === "m.cross_signing.user_signing"
        ) {
            const callbacks = client.getCrossSigningCacheCallbacks();
            if (!callbacks.getCrossSigningKeyCache) return;
            const keyId = name.replace("m.cross_signing.", "");
            const key = await callbacks.getCrossSigningKeyCache(keyId);
            if (!key) {
                console.log(
                    `${keyId} requested by ${deviceId}, but not found in cache`,
                );
            }
            return key && encodeBase64(key);
        } else if (name === "m.megolm_backup.v1") {
            const key = await client._crypto.getSessionBackupPrivateKey();
            if (!key) {
                console.log(
                    `session backup key requested by ${deviceId}, but not found in cache`,
                );
            }
            return key && encodeBase64(key);
        }
        console.warn("onSecretRequested didn't recognise the secret named ", name);
      }
      
export const crossSigningCallbacks = {
    getSecretStorageKey,
    onSecretRequested,
};