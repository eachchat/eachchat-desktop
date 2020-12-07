/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

const KEY_BACKUP_POLL_INTERVAL = 5 * 60 * 1000;

export default class DeviceListener {
    // private dispatcherRef: string;
    // // device IDs for which the user has dismissed the verify toast ('Later')
    // private dismissed = new Set<string>();
    // // has the user dismissed any of the various nag toasts to setup encryption on this device?
    // private dismissedThisDeviceToast = false;
    // // cache of the key backup info
    // private keyBackupInfo: object = null;
    // private keyBackupFetchedAt: number = null;
    // // We keep a list of our own device IDs so we can batch ones that were already
    // // there the last time the app launched into a single toast, but display new
    // // ones in their own toasts.
    // private ourDeviceIdsAtStart: Set<string> = null;
    // // The set of device IDs we're currently displaying toasts for
    // private displayingToastsForDeviceIds = new Set<string>();

    constructor(matrixClient) {
        this.matrixClient = matrixClient;
        this._recheck = this._recheck.bind(this);
        this._onWillUpdateDevices = this._onWillUpdateDevices.bind(this);
        this._onDevicesUpdated = this._onDevicesUpdated.bind(this);
        this._onDeviceVerificationChanged = this._onDeviceVerificationChanged.bind(this);
        this._onUserTrustStatusChanged = this._onUserTrustStatusChanged.bind(this);
        this._onCrossSingingKeysChanged = this._onCrossSingingKeysChanged.bind(this);
        this._onAccountData = this._onAccountData.bind(this);
        this._onSync = this._onSync.bind(this);
        this._onRoomStateEvents = this._onRoomStateEvents.bind(this);
        // this.dismissed = this.dismissed.bind(this);
        // this.dismissedThisDeviceToast = this.dismissedThisDeviceToast.bind(this);
        // this.keyBackupInfo = this.keyBackupInfo.bind(this);
        // this.keyBackupFetchedAt = this.keyBackupFetchedAt.bind(this);
        // this.ourDeviceIdsAtStart = this.ourDeviceIdsAtStart.bind(this);
        // this.displayingToastsForDeviceIds = this.displayingToastsForDeviceIds.bind(this);
    }

    static sharedInstance() {
        DeviceListener._sharedInstance = new DeviceListener(global.mxMatrixClientPeg.matrixClient);
        return DeviceListener._sharedInstance;
        // if (!window.mxDeviceListener) window.mxDeviceListener = new DeviceListener();
        // return window.mxDeviceListener;
    }

    start() {
        this.matrixClient.on('crypto.willUpdateDevices', this._onWillUpdateDevices);
        this.matrixClient.on('crypto.devicesUpdated', this._onDevicesUpdated);
        this.matrixClient.on('deviceVerificationChanged', this._onDeviceVerificationChanged);
        this.matrixClient.on('userTrustStatusChanged', this._onUserTrustStatusChanged);
        this.matrixClient.on('crossSigning.keysChanged', this._onCrossSingingKeysChanged);
        this.matrixClient.on('accountData', this._onAccountData);
        this.matrixClient.on('sync', this._onSync);
        this.matrixClient.on('RoomState.events', this._onRoomStateEvents);

        this._recheck();
        
        this.dismissed = [];
        this.dismissedThisDeviceToast = false;
        this.keyBackupInfo = null;
        this.keyBackupFetchedAt = null;
        this.ourDeviceIdsAtStart = [];
        this.displayingToastsForDeviceIds = [];
    }

    stop() {
        if (this.matrixClient) {
            this.matrixClient.removeListener('crypto.willUpdateDevices', this._onWillUpdateDevices);
            this.matrixClient.removeListener('crypto.devicesUpdated', this._onDevicesUpdated);
            this.matrixClient.removeListener('deviceVerificationChanged', this._onDeviceVerificationChanged);
            this.matrixClient.removeListener('userTrustStatusChanged', this._onUserTrustStatusChanged);
            this.matrixClient.removeListener('crossSigning.keysChanged', this._onCrossSingingKeysChanged);
            this.matrixClient.removeListener('accountData', this._onAccountData);
            this.matrixClient.removeListener('sync', this._onSync);
            this.matrixClient.removeListener('RoomState.events', this._onRoomStateEvents);
        }
    }

    _ensureDeviceIdsAtStartPopulated() {
        if (this.ourDeviceIdsAtStart === null) {
            const cli = this.matrixClient;
            this.ourDeviceIdsAtStart = new Set(
                cli.getStoredDevicesForUser(cli.getUserId()).map(d => d.deviceId),
            );
        }
    }

    async _onWillUpdateDevices(users, initialFetch) {
        // If we didn't know about *any* devices before (ie. it's fresh login),
        // then they are all pre-existing devices, so ignore this and set the
        // devicesAtStart list to the devices that we see after the fetch.
        if (initialFetch) return;

        const myUserId = this.matrixClient.getUserId();
        if (users.indexOf(myUserId) >= 0) this._ensureDeviceIdsAtStartPopulated();

        // No need to do a recheck here: we just need to get a snapshot of our devices
        // before we download any new ones.
    }

    _onDevicesUpdated(users) {
        if (users.indexOf(this.matrixClient.getUserId()) < 0) return;
        this._recheck();
    }

    _onDeviceVerificationChanged(userId) {
        if (userId !== this.matrixClient.getUserId()) return;
        this._recheck();
    }

    _onUserTrustStatusChanged(userId) {
        if (userId !== this.matrixClient.getUserId()) return;
        this._recheck();
    }

    _onCrossSingingKeysChanged() {
        this._recheck();
    }

    _onAccountData(ev) {
        // User may have:
        // * migrated SSSS to symmetric
        // * uploaded keys to secret storage
        // * completed secret storage creation
        // which result in account data changes affecting checks below.
        if (
            ev.getType().startsWith('m.secret_storage.') ||
            ev.getType().startsWith('m.cross_signing.')
        ) {
            this._recheck();
        }
    }

    _onSync(state, prevState){
        if (state === 'PREPARED' && prevState === null) this._recheck();
    }

    _onRoomStateEvents(ev) {
        if (ev.getType() !== "m.room.encryption") {
            return;
        }

        // If a room changes to encrypted, re-check as it may be our first
        // encrypted room. This also catches encrypted room creation as well.
        this._recheck();
    }

    _onAction({ action }) {
        if (action !== "on_logged_in") return;
        this._recheck();
    }

    // The server doesn't tell us when key backup is set up, so we poll
    // & cache the result
    async _getKeyBackupInfo() {
        const now = (new Date()).getTime();
        if (!this.keyBackupInfo || this.keyBackupFetchedAt < now - KEY_BACKUP_POLL_INTERVAL) {
            this.keyBackupInfo = await this.matrixClient.getKeyBackupVersion();
            this.keyBackupFetchedAt = now;
        }
        return this.keyBackupInfo;
    }

    shouldShowSetupEncryptionToast() {
        // If we're in the middle of a secret storage operation, we're likely
        // modifying the state involved here, so don't add new toasts to setup.
        // if (isSecretStorageBeingAccessed()) return false;
        // Show setup toasts once the user is in at least one encrypted room.
        const cli = this.matrixClient;
        return cli && cli.getRooms().map(r => cli.isRoomEncrypted(r.roomId));
    }

    async _recheck() {
        const cli = this.matrixClient;

        if (!await cli.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing")) return;

        if (!cli.isCryptoEnabled()) return;
        // don't recheck until the initial sync is complete: lots of account data events will fire
        // while the initial sync is processing and we don't need to recheck on each one of them
        // (we add a listener on sync to do once check after the initial sync is done)
        if (!cli.isInitialSyncComplete()) return;

        const crossSigningReady = await cli.isCrossSigningReady();
        const secretStorageReady = await cli.isSecretStorageReady();
        const allSystemsReady = crossSigningReady && secretStorageReady;

        if (this.dismissedThisDeviceToast || allSystemsReady) {
            // hideSetupEncryptionToast();
        } else if (this.shouldShowSetupEncryptionToast()) {
            // make sure our keys are finished downloading
            await cli.downloadKeys([cli.getUserId()]);
            // cross signing isn't enabled - nag to enable it
            // There are 3 different toasts for:
            if (
                !cli.getCrossSigningId() &&
                cli.getStoredCrossSigningForUser(cli.getUserId())
            ) {
                // Cross-signing on account but this device doesn't trust the master key (verify this session)
                // showSetupEncryptionToast(SetupKind.VERIFY_THIS_SESSION);
            } else {
                const backupInfo = await this._getKeyBackupInfo();
                if (backupInfo) {
                    // No cross-signing on account but key backup available (upgrade encryption)
                    // showSetupEncryptionToast(SetupKind.UPGRADE_ENCRYPTION);
                } else {
                    // No cross-signing or key backup on account (set up encryption)
                    await cli.waitForClientWellKnown();
                    // if (isSecureBackupRequired() && isLoggedIn()) {
                    //     // If we're meant to set up, and Secure Backup is required,
                    //     // trigger the flow directly without a toast once logged in.
                    //     // hideSetupEncryptionToast();
                    //     // accessSecretStorage();
                    // } else {
                    //     // showSetupEncryptionToast(SetupKind.SET_UP_ENCRYPTION);
                    // }
                }
            }
        }

        // This needs to be done after awaiting on downloadKeys() above, so
        // we make sure we get the devices after the fetch is done.
        this._ensureDeviceIdsAtStartPopulated();

        // Unverified devices that were there last time the app ran
        // (technically could just be a boolean: we don't actually
        // need to remember the device IDs, but for the sake of
        // symmetry...).
        const oldUnverifiedDeviceIds = [];
        // Unverified devices that have appeared since then
        const newUnverifiedDeviceIds = [];

        // as long as cross-signing isn't ready,
        // you can't see or dismiss any device toasts
        if (crossSigningReady) {
            const devices = cli.getStoredDevicesForUser(cli.getUserId());
            for(var i=0;i<devices.length;i++) {
                if(devices[i] == cli.deviceId) return;

                const deviceTrust = await cli.checkDeviceTrust(cli.getUserId(), devices[i].deviceId);
                if (!deviceTrust.isCrossSigningVerified() && this.dismissed.indexOf(devices[i].deviceId) < 0) {
                    if (this.ourDeviceIdsAtStart.indexOf(devices[i].deviceId) < 0) {
                        oldUnverifiedDeviceIds.push(devices[i].deviceId);
                    } else {
                        newUnverifiedDeviceIds.push(devices[i].deviceId);
                    }
                }
            }
        }

        // Display or hide the batch toast for old unverified sessions
        if (oldUnverifiedDeviceIds.length > 0) {
            // showBulkUnverifiedSessionsToast(oldUnverifiedDeviceIds);
        } else {
            // hideBulkUnverifiedSessionsToast();
        }

        // Show toasts for new unverified devices if they aren't already there
        // for (const deviceId of newUnverifiedDeviceIds) {
        //     // showUnverifiedSessionsToast(deviceId);
        // }

        // ...and hide any we don't need any more
        // for (const deviceId of this.displayingToastsForDeviceIds) {
        //     if (newUnverifiedDeviceIds.indexOf(deviceId) < 0) {
        //         // hideUnverifiedSessionsToast(deviceId);
        //     }
        // }

        this.displayingToastsForDeviceIds = newUnverifiedDeviceIds;
    }
}
