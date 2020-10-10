import olmWasmPath from "olm/olm.wasm"
import Olm from 'olm';
import * as matrixcs from 'matrix-js-sdk'

class _MatrixClientPeg{
    constructor(){
        this.matrixClient = undefined;
        this.homeserve = "";
        this.registrationClient = undefined;
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
    }

    createMatrixClient(opts) {
        let indexedDB = window.indexedDB;
        let localStorage = window.localStorage;
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
        this.matrixClient = this.createMatrixClient(ops)
        if(this.matrixClient == undefined)
            return false;
        return true;
    }
}

if (!window.mxMatrixClientPeg) {
    window.mxMatrixClientPeg = new _MatrixClientPeg();
    window.mxMatrixClientPeg.InitOlm();
}

export const MatrixClientPeg = window.mxMatrixClientPeg;


